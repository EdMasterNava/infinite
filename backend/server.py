from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import base64
from io import BytesIO
from PIL import Image
import torch
import torchvision.transforms.functional as TF
import numpy as np
import random
from gradio_client import Client
import openai

def decode_base64_image(base64_string):
    print("decode_base64_image")
    try:
        # Remove the header from the base64 string (e.g., 'data:image/png;base64,')
        _, data = base64_string.split(',', 1)

        # Decode the base64 string into bytes
        image_data = base64.b64decode(data)

        # Create a BytesIO object to read the image data
        image_stream = BytesIO(image_data)

        # Use the Pillow library (PIL) to open the image from the BytesIO stream
        image = Image.open(image_stream)

        return image

    except Exception as e:
        print(f"Error decoding the base64 image: {e}")
        return None
    
def image_prepoccessing(image):
    print("image_prepoccessing")
    # crop image
    min_dimension = min(image.size)
    left = (image.width - min_dimension) / 2
    top = (image.height - min_dimension) / 2
    right = (image.width + min_dimension) / 2
    bottom = (image.height + min_dimension) / 2
    cropped_image = image.crop((left, top, right, bottom))

    # resize image
    new_size = (1024, 1024)
    resized_image = cropped_image.resize(new_size)

    # make b&w
    bw_image = resized_image.convert("L")

    # invert image
    image_array = np.array(bw_image)
    inverted_image_array = 255 - image_array
    inverted_image = Image.fromarray(inverted_image_array)

    # display(inverted_image)

    image = inverted_image.convert("RGB")
    image = TF.to_tensor(image) > 0.5
    image = TF.to_pil_image(image.to(torch.float32))
    return image

def convert_to_png(image, output_file_path='uploaded_image.png'):
    print("convert_to_png")
    try:
        # Ensure that the output file path has the .png extension
        if not output_file_path.lower().endswith('.png'):
            output_file_path += '.png'

        # Save the image as a PNG file
        image.save(output_file_path, format='PNG')
        return output_file_path

    except Exception as e:
        print(f"Error converting the image to PNG: {e}")
    
def get_custom_str(items, str=""):
    return " ".join([f"{item}{str}," for item in items])

def build_prompt(feel, prim_color, sec_colors):
  return f'''ux design, minimal and clean design, lots of white space, focus more on user interface,
intuitive design, primary color is {prim_color}, secondary colors are {get_custom_str(sec_colors)} 
and the look and feel is {feel}'''.replace('\n', ' ')

def generate_ui(prompt, image, style):
    print("generate_ui")
    client = Client("https://tencentarc-t2i-adapter-sdxl.hf.space/")
    result = client.predict(
        image,	# str (filepath or URL to image) in 'Input image' Image component
        prompt,
        "extra digit, fewer digits, cropped, worst quality, low quality, glitch, deformed, mutated, ugly, disfigured, text heavy",	# str in 'Negative prompt' Textbox component
        'sketch',	# str (Option from: ['canny', 'sketch', 'lineart', 'depth-midas', 'depth-zoe', 'openpose']) in 'Adapter name' Dropdown component
        "Anime",	# str (Option from: ['(No style)', 'Cinematic', '3D Model', 'Anime', 'Digital Art', 'Photographic', 'Pixel art', 'Fantasy art', 'Neonpunk', 'Manga']) in 'Style' Dropdown component
        32,	# int | float (numeric value between 1 and 50) in 'Number of steps' Slider component
        5.0,	# int | float (numeric value between 0.1 and 30.0) in 'Guidance scale' Slider component
        0.8,	# int | float (numeric value between 0.5 and 1) in 'Adapter conditioning scale' Slider component
        0.8,	# int | float (numeric value between 0.5 and 1.0) in 'Adapter conditioning factor' Slider component
        random.randint(0, 2147483647),	# int | float (numeric value between 0 and 2147483647) in 'Seed' Slider component
        False,	# bool in 'Apply preprocess' Checkbox component
        api_name="/run"
    )
    return result

def read_json_file(file_path):
    print("reading json file")
    try:
        print("file path: ")
        print(file_path)
        with open(f'{file_path}/captions.json', 'r') as file:
            data = json.load(file)
            return data
    except FileNotFoundError:
        print(f"Error: File not found at path '{file_path}'")
        return None
    except json.JSONDecodeError as e:
        print(f"Error decoding JSON: {e}")
        return None
    except Exception as e:
        print(f"An error occurred: {e}")
        return None

def extract_keys(json_data):
    print("extracting keys")
    if isinstance(json_data, dict):
        return list(json_data.keys())
    else:
        print("Input is not a valid JSON object.")
        return None
    
def retrieve_generated_image_file_path(json_file_path):
    print("retrieving generated image file path")
    json = read_json_file(json_file_path)
    key_names = extract_keys(json)
    image_file_path = key_names[1]
    return image_file_path

def encode_image_to_base64(image_path):
    print("encoding image to base64")
    try:
        with open(image_path, "rb") as image_file:
            # Read the binary data of the image file
            image_binary_data = image_file.read()

            # Encode the binary data to base64
            base64_encoded = base64.b64encode(image_binary_data).decode('utf-8')
            b64_json = {'b64': base64_encoded}
            return json.dumps(b64_json)
    except FileNotFoundError:
        print(f"Error: Image file not found at path '{image_path}'")
        return None
    except Exception as e:
        print(f"An error occurred: {e}")
        return None

def base64_to_uint8array(base64_string):
    print("base64_to_uint8array")
    try:
        # Remove the header from the base64 string (e.g., 'data:image/png;base64,')
        _, data = base64_string.split(',', 1)

        # Decode the base64 string into bytes
        image_data = base64.b64decode(data)

        # Create a Uint8Array (bytearray in Python) from the bytes
        uint8_array = bytearray(image_data)

        return uint8_array
    except Exception as e:
        print(f"Error converting base64 to Uint8Array: {e}")
        return None
    
app = Flask(__name__)
CORS(app)

@app.route("/", methods=["POST", "GET"])
def home():
    return {"Title": "Infinite UI"}

@app.route("/generate", methods=["POST"])
def generate():
    if (request.is_json):
        try:
            look_and_feel = request.json['lookAndFeel']
            primary_color = request.json['primaryColor']
            secondary_colors = request.json['secondaryColors']
            style = request.json['style']

            image = decode_base64_image(request.json['image'])
            image = image_prepoccessing(image)
            image_path = convert_to_png(image)

            prompt = build_prompt(feel=look_and_feel, prim_color=primary_color, sec_colors=secondary_colors)
            
            json_path = generate_ui(prompt=prompt, image=image_path, style=style)
            generated_image_file_path = retrieve_generated_image_file_path(json_path)
            base64_image_payload = encode_image_to_base64(generated_image_file_path)
            # print(base64_image_payload)
            # uint8array = base64_to_uint8array(base64_image_payload["b64"])
            # print(uint8array)
            return jsonify({"result": base64_image_payload})
        except Exception as e:
            return jsonify({"error": str(e)}), 500 
    return jsonify({"error": "Invalid request format"}), 400   

if __name__ == "__main__": 
    app.run(debug=True)
    