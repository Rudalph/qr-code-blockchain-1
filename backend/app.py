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
    
  
  
if __name__ == '__main__':
    app.run(debug=True)
