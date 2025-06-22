// frontend/src/components/BarcodeScanner.js
import React, { useState, useRef, useEffect } from 'react';
import Webcam from 'react-webcam';
import { Button, Box, Dialog, DialogTitle, DialogContent, DialogActions, Tabs, Tab, Paper, Typography } from '@mui/material';
import { BrowserQRCodeReader } from '@zxing/library';

const BarcodeScanner = ({ open, onClose, onScan }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [result, setResult] = useState('');
  const webcamRef = useRef(null);
  const fileInputRef = useRef(null);
  const codeReader = new BrowserQRCodeReader();

  useEffect(() => {
    return () => {
      codeReader.reset();
    };
  }, []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setResult('');
  };

  const handleScan = (data) => {
    if (data) {
      setResult(data);
      onScan(data);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        const result = await codeReader.decodeFromImage(undefined, URL.createObjectURL(file));
        if (result) {
          handleScan(result.text);
        }
      } catch (error) {
        console.error('Error decoding barcode:', error);
        setResult('Error: Could not read barcode/QR code');
      }
    }
  };

  const startCameraScan = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (webcamRef.current) {
        webcamRef.current.video.srcObject = stream;
        codeReader.decodeFromVideoDevice(undefined, webcamRef.current.video, (result, error) => {
          if (result) {
            handleScan(result.text);
            stream.getTracks().forEach(track => track.stop());
          }
          if (error) {
            console.error(error);
          }
        });
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setResult('Error: Could not access camera');
    }
  };

  const handleRetry = () => {
    setResult('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (activeTab === 0 && webcamRef.current) {
      startCameraScan();
    }
  };

  useEffect(() => {
    if (open && activeTab === 0) {
      startCameraScan();
    }
  }, [open, activeTab]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Scan Barcode/QR Code</DialogTitle>
      <DialogContent>
        <Paper square>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="fullWidth"
            indicatorColor="primary"
            textColor="primary"
          >
            <Tab label="Camera" />
            <Tab label="Upload Image" />
          </Tabs>
        </Paper>

        <Box mt={2} style={{ textAlign: 'center' }}>
          {activeTab === 0 ? (
            <Box>
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                style={{ width: '100%', maxHeight: 400 }}
                videoConstraints={{ facingMode: 'environment' }}
              />
            </Box>
          ) : (
            <Box>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="barcode-file"
                type="file"
                onChange={handleFileUpload}
                ref={fileInputRef}
              />
              <label htmlFor="barcode-file">
                <Button variant="contained" component="span" fullWidth>
                  Upload Image
                </Button>
              </label>
            </Box>
          )}
          
          {result && (
            <Box mt={2}>
              <Typography variant="h6" gutterBottom>
                Scanned Code:
              </Typography>
              <Typography variant="body1" paragraph>
                {result}
              </Typography>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleRetry} 
                fullWidth
                sx={{ mt: 2 }}
              >
                Scan Again
              </Button>
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BarcodeScanner;