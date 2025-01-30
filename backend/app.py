from flask import Flask, request, jsonify
from flask_cors import CORS
import hashlib
import qrcode
import base64
from io import BytesIO

app = Flask(__name__)
CORS(app)

@app.route('/qrcode', methods=['POST'])
def generate_qrcode():
    data = request.json
    product_name = data['product_name'].lower()
    batch_number = data['batch_number'].lower()
    location = data['location'].lower()
    date = data['date'].lower().replace('-', '')
    serial_number = data['serial_number'].lower()
    price = data['price'].lower()
    weight = data['weight'].lower()
    man_name = data['man_name'].lower()
    
    url = f"http://127.0.0.1:5000/products/{product_name}/{location}/{date}/{batch_number}/{serial_number}"
    
    hash_obj = hashlib.sha256()
    hash_obj.update(url.encode())
    hash_value = hash_obj.hexdigest()
    
    qr = qrcode.QRCode(
    version=1,
    error_correction=qrcode.constants.ERROR_CORRECT_L,
    box_size=10,
    border=4,
    )
    
    qr.add_data(url)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    
    
    buffered = BytesIO()
    img.save(buffered, format="PNG")
    img_base64 = base64.b64encode(buffered.getvalue()).decode('utf-8')
    
    
    return jsonify({
            'success': True,
            'qr_image' : img_base64,
            'url' : url,
            'hash_value' : hash_value
        })
    



from werkzeug.utils import secure_filename
import os
import zxing
import re


# Configure upload folder
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

# Function to read QR code from image
def read_qr_code(image_path):
    reader = zxing.BarCodeReader()
    barcode = reader.decode(image_path)
    
    if barcode:
        qr_data = barcode.raw
        print("QR Code Data:", qr_data)

        # Regex to extract product_name and serial_number
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

# API route for QR code processing
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
