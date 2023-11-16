import React, { useState } from 'react';
import { ConfigProvider, theme, Button, /*Upload, message,*/ Form, Input, Row, Col, Select, ColorPicker } from "antd";
// import { UploadOutlined } from '@ant-design/icons';
import axios from 'axios';
import '../styles/ui.css';

const { TextArea } = Input;
const { Option } = Select;

function App() {
  const { darkAlgorithm } = theme;
  // const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [lookAndFeel, setLookAndFeel] = useState<string>('');
  const [primaryColor, setPrimaryColor] = useState('#5B8FF9');
  const [secondaryColors, setSecondaryColors] = useState(['#99EF2B', '#EFDB2B', '#ED962C', '#EE2F32']);
  const [style, setStyle] = useState<string>();
  const [selectedImage, setSelectedImage] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    console.log(file)
    // Check if a file is selected
    if (file) {
      // Check if the selected file is an image
      if (file.type.startsWith('image/')) {
        // Set the selected image to the state
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = () => {
          const base64data = reader.result;
          setSelectedImage(base64data);
        } 
        
      } else {
        // Alert the user if the selected file is not an image
        alert('Please select a valid image file.');
      }
    }
  };

  const handlePrimaryColorChange = (color: any) => {
    setPrimaryColor(color.hex);
  };

  const handleSecondaryColorChange = (color: any, index: number) => {
    // TODO: Test to see if these colors are being updated
    const newColors = [...secondaryColors];
    newColors[index] = color.hex;
    setSecondaryColors(newColors);
  };

  const handleLookAndFeelChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLookAndFeel(event.target.value);
  };

  const handleStyleChange = (value: string) => {
    setStyle(value);
  };

  const handleGenerate = () => {
    postImage();
  }

  const postImage = async () => {
    try {
      axios.post('http://127.0.0.1:5000/generate', {image: selectedImage})
      .then(response => {
        console.log('Response:', response.data);
      })
      .catch(error => {
        console.error('Error:', error);
      });
      // const response = await fetch('http://127.0.0.1:5000/generate', {
      //   method: 'POST',
      //   // headers: {
      //   //   "Content-Type": "application/json"
      //   // },
      //   body: JSON.stringify({image: selectedImage})
      //   // body: formData,
      // });
      // console.log("Response: ", response)

      // if (response.ok) {
      //   const data = await response.json();
      //   message.success('Image uploaded successfully');
      //   console.log(data);
      //   // Do something with the response if needed
      // } else {
      //   message.error('Failed to upload image');
      // }
    } catch (error) {
      console.log(error);
      // message.error('An error occurred while uploading the image');
    }
  }


  // const beforeUpload = (file: any) => {
  //   const isImage = file.type.startsWith('image/');
  //   if (!isImage) {
  //     message.error('You can only upload image files!');
  //   } else {
  //     setUploadedFile(file); // Store the file
  //   }
  //   return isImage || Upload.LIST_IGNORE;
  // };

  return (
      <ConfigProvider
        theme={{
          algorithm: darkAlgorithm,
        }}>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
          />
          {/* <Upload
            accept="image/*"
            beforeUpload={beforeUpload}
            listType="picture"
            maxCount={1}
            showUploadList={true}
          >
            <Button icon={<UploadOutlined rev={undefined} />}>Click to upload</Button>
          </Upload> */}
          <Form layout="vertical">
            <Form.Item label="Look & Feel">
            <TextArea 
            placeholder="UI that feels fun and exciting..." 
            value={lookAndFeel}
            onChange={handleLookAndFeelChange}
            autoSize={{ minRows: 3, maxRows: 3 }}  // Set min and max rows to 3
          />
            </Form.Item>
          </Form>
          <Form>
            <Row gutter={8} align="middle" style={{ alignItems: 'center' }}>
              <Col style={{ display: 'flex', alignItems: 'center', justifyContent: 'end', paddingRight: '8px', paddingBottom:'10px' }}>
                <span>Primary Color</span>
              </Col>
              <Col>
                <Form.Item>
                  <ColorPicker trigger="hover" placement='bottom' defaultValue={primaryColor} onChange={(color) => handlePrimaryColorChange(color)}/>
                </Form.Item>
              </Col>
            </Row>
          </Form>
          <Form>
            <Row gutter={8} align="middle" style={{ alignItems: 'center' }}>
              <Col style={{ display: 'flex', alignItems: 'center', justifyContent: 'end', paddingRight: '8px', paddingBottom:'10px' }}>
                <span>Secondary Colors</span>
              </Col>
              <Col>
                <Form.Item>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  {secondaryColors.map((color, index) => (
                    <ColorPicker trigger="hover" placement='bottom' style={{ marginRight: '1px' }} defaultValue={color} onChange={(color) => handleSecondaryColorChange(color, index)}/>
                    ))}
                </div>
                </Form.Item>
              </Col>
            </Row>
          </Form>
          <Form layout='inline'>
            <Form.Item label="Style">
              <Select placeholder="Select a style" onChange={handleStyleChange} value={style}>
                <Option value="tech">Cinematic</Option>
                <Option value="nature">Anime</Option>
                <Option value="business">Photographic</Option>
                <Option value="business">Fantasy Art</Option>
              </Select>
            </Form.Item>
          </Form>
          <Button type='primary' size='large' block onClick={handleGenerate}>Generate</Button>
      </ConfigProvider>      
  );
}

export default App;
