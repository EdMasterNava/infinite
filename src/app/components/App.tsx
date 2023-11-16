import React, { useState } from 'react';
import { Buffer } from 'buffer';
import { ConfigProvider, theme, Button, Form, Input, Row, Col, Select, ColorPicker } from "antd";

import axios from 'axios';
import { UploadOutlined } from '@ant-design/icons';
import '../styles/ui.css';

const { TextArea } = Input;
const { Option } = Select;

function App() {
  const { darkAlgorithm } = theme;
  const [lookAndFeel, setLookAndFeel] = useState<string>('');
  const [primaryColor, setPrimaryColor] = useState('#5B8FF9');
  const [secondaryColors, setSecondaryColors] = useState(['#99EF2B', '#EFDB2B', '#ED962C', '#EE2F32']);
  const [style, setStyle] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState(null);
  // const [generatedImage, setGeneratedImage] = useState(null)

  const handleImageChange = (e) => {
    const file = e.target.files[0];
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
  function base64ToUint8Array(base64String: string): Uint8Array | null {
    try {
      console.log("base64ToUint8Array: ", base64String)
      // Remove the data URL prefix if present
      const base64WithoutPrefix = base64String.replace(/^data:\w+\/\w+;base64,/, '');
  
      // Decode the base64 string using Buffer
      // const buffer = Buffer.from(base64WithoutPrefix, 'base64');
      const buffer = Buffer.from(base64WithoutPrefix, 'base64');
  
      // Create a Uint8Array from the Buffer
      const uint8Array = new Uint8Array(buffer);
  
      return uint8Array;
    } catch (error) {
      console.error('Error converting base64 to Uint8Array:', error.message);
      return null;
    }
  }

  const postImage = async () => {
    try {
      axios.post('http://127.0.0.1:5000/generate', 
        {
          image: selectedImage,
          lookAndFeel,
          primaryColor,
          secondaryColors,
          style
        }
      )
      .then(response => {
        const b64JSON = response.data.result
        const bs4 = JSON.parse(b64JSON)["b64"]
        const uint8Array = base64ToUint8Array(bs4)
        

        parent.postMessage({ pluginMessage: { type: 'generated-image', uint8Array } }, '*');
      })
      .catch(error => {
        console.error('Error:', error);
      });
    } catch (error) {
      console.log(error);
    }
  }


  const triggerFileInput = () => {
    fileInputRef.current.click();
  };
  return (
      <ConfigProvider
        theme={{
          algorithm: darkAlgorithm,
        }}>
          <div style={{marginBottom:40}}>
            <input
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleImageChange}
              ref={fileInputRef}
            />
            <Button type='dashed' size='large' icon={<UploadOutlined rev={undefined}/>} onClick={triggerFileInput}>
              Upload Image
            </Button>
          </div>
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
                <Option value="business">Digital Art</Option>
              </Select>
            </Form.Item>
          </Form>
          <Button type='primary' size='large' block onClick={handleGenerate} loading={loading}>Generate</Button>
      </ConfigProvider>      
  );
}

export default App;
