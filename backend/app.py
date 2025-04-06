from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
import qrcode
import qrcode.constants
import os
import hashlib
from io import BytesIO
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
import re
from email.mime.multipart import MIMEMultipart
from email.mime.application import MIMEApplication
from email.mime.text import MIMEText
import smtplib
import requests

app = Flask(__name__)
CORS(app)

def send_pdf_via_email(manufacturer_email: str, pdf_buffer):
    sender_email = "placementpro.jkl@gmail.com"
    sender_password = 'iyps pbzz beyx ivxq '
    subject = "QR Codes PDF"
    body = "Please find attached the QR codes PDF."

    msg = MIMEMultipart()
    msg["From"] = sender_email
    msg["To"] = manufacturer_email
    msg["Subject"] = subject
    msg.attach(MIMEText(body, "plain"))

    pdf_buffer.seek(0)
    pdf_attachment = MIMEApplication(pdf_buffer.read(), _subtype="pdf")
    pdf_attachment.add_header("Content-Disposition", "attachment", filename=f"{manufacturer_email.removesuffix('@gmail.com')}.pdf")
    msg.attach(pdf_attachment)

    with smtplib.SMTP("smtp.gmail.com", 587) as server:
        server.starttls()
        server.login(sender_email, sender_password)
        server.send_message(msg)
        
@app.route('/generate-qr', methods=["POST"])
def generate_qr():
    print("API called ...")
    pdf_buffer = BytesIO()
    pdf = canvas.Canvas(pdf_buffer, pagesize=letter)
    
    x, y = 20, 700
    pdf.setFont("Helvetica", 5)

    try:
        data = request.json
        urls = data.get("urls")

        if not urls:
            return jsonify({ "error": "Missing url" }), 400
        
        print("Received URLs... Starting QR code pdf generation...")
        
        for url in urls:
            encrypted_url = f'http://localhost:3001/products/{url}'

            qr = qrcode.QRCode(
                version=None,
                box_size=2,
                border=1,
                error_correction=qrcode.constants.ERROR_CORRECT_H
            )
            qr.add_data(encrypted_url)
            qr.make(fit=True)
            
            hash_obj = hashlib.sha256()
            hash_obj.update(encrypted_url.encode())
            hash_value = hash_obj.hexdigest()
            
            qr_img = qr.make_image(fill="black", back_color="white")

            pattern = r"/([^/]+)/([^/]+)/([^/]+)/([^/]+)"
            pattern_match = re.match(pattern, url)
            
            if pattern_match:
                product_name = pattern_match.group(1)
                date = pattern_match.group(3)
                location = pattern_match.group(2)
                batch = pattern_match.group(4)
            else:
                print(f"Warning: URL format mismatch - {url}")
                continue

            formatted_date = f"{date[:2]}/{date[2:4]}/{date[4:]}"

            pdf.setFont("Helvetica", 5)
            pdf.drawCentredString(x + 20, y + 41, batch)

            pdf.drawInlineImage(qr_img, x, y, width=40, height=40)

            pdf.setFont("Helvetica", 5)
            pdf.drawCentredString(x + 20, y - 5, product_name)

            pdf.saveState()
            pdf.setFont("Helvetica", 5)
            pdf.translate(x - 2, y + 20)
            pdf.rotate(90)
            pdf.drawCentredString(0, 0, formatted_date)
            pdf.restoreState()

            pdf.saveState()
            pdf.setFont("Helvetica", 5)
            pdf.translate(x + 45, y + 20)
            pdf.rotate(90)
            pdf.drawCentredString(0, 0, location)
            pdf.restoreState()

            x += 60
            if x > 600:
                x = 20
                y -= 60

            if y < 80:
                pdf.showPage()
                x, y = 20, 700 
                pdf.setFont("Helvetica", 5)

        pdf.save()
        
        send_pdf_via_email('keithzidand@gmail.com', pdf_buffer)
        
        return jsonify({ 
            "success": "QR Code Generated",
        }), 200

    except Exception as e:
        return jsonify({ "error": str(e) }), 500


from werkzeug.utils import secure_filename
import os
import zxing
import re

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

def read_qr_code(image_path):
    reader = zxing.BarCodeReader()
    barcode = reader.decode(image_path)
    
    if barcode:
        qr_data = barcode.raw
        print("QR Code Data:", qr_data)

        pattern = r"https://[^/]+/products/([^/]+)/[^/]+/[^/]+/[^/]+/([^/]+)"
        match = re.match(pattern, qr_data)

        if match:
            product_name = match.group(1)
            serial_number = match.group(2)
            formatted_string = f"{product_name}_{serial_number}"
            return {"url": qr_data, "formatted_string": formatted_string}
        else:
            return {"error": "URL format does not match expected pattern."}
    else:
        return {"error": "No QR code detected"}

@app.route("/upload_qr", methods=["POST"])
def upload_qr():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    
    file = request.files["file"]

    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400
    
    filename = secure_filename(file.filename)
    file_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
    file.save(file_path)

    result = read_qr_code(file_path)
    return jsonify(result)

if __name__ == '__main__':
    app.run(debug=True)
