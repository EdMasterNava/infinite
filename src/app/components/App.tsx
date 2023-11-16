import React, { useState } from 'react';
import { ConfigProvider, theme, Button, Upload, message, Form, Input, Row, Col, Select, ColorPicker } from "antd";
import { UploadOutlined } from '@ant-design/icons';
import '../styles/ui.css';

const { TextArea } = Input;
const { Option } = Select;

function App() {
  const { darkAlgorithm } = theme;
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [lookAndFeel, setLookAndFeel] = useState<string>('');
  const [primaryColor, setPrimaryColor] = useState('#5B8FF9');
  const [secondaryColors, setSecondaryColors] = useState(['#99EF2B', '#EFDB2B', '#ED962C', '#EE2F32']);
  const [style, setStyle] = useState<string>();

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
    if (!uploadedFile) {
      message.error('No image selected');
      return;
    }

    const formData = new FormData();
    formData.append('image', uploadedFile);

    try {
      const response = await fetch('YOUR_API_ENDPOINT', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        message.success('Image uploaded successfully');
        // Do something with the response if needed
      } else {
        message.error('Failed to upload image');
      }
    } catch (error) {
      message.error('An error occurred while uploading the image');
    }
  }


  const beforeUpload = (file: any) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('You can only upload image files!');
    } else {
      setUploadedFile(file); // Store the file
    }
    return isImage || Upload.LIST_IGNORE;
  };

  return (
      <ConfigProvider
        theme={{
          algorithm: darkAlgorithm,
        }}>
          <Upload
            accept="image/*"
            beforeUpload={beforeUpload}
            listType="picture"
            maxCount={1}
            showUploadList={false}
          >
            <Button icon={<UploadOutlined rev={undefined} />}>Click to upload</Button>
          </Upload>
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
