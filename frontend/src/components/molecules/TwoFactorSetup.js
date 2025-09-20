import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Button, Typography, Card, Icon } from '../atoms';
import FormField from './FormField';

const TwoFactorSetup = ({ 
  onComplete, 
  onCancel, 
  className = '',
  ...props 
}) => {
  const [step, setStep] = useState(1);
  const [qrCode, setQrCode] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Simulate generating QR code and secret key
    setQrCode('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');
    setSecretKey('JBSWY3DPEHPK3PXP');
    setBackupCodes([
      '12345678', '87654321', '11223344', '44332211',
      '55667788', '88776655', '99001122', '22110099'
    ]);
  }, []);

  const handleVerifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Simulate API call to verify code
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate verification (in real app, this would call the backend)
      if (verificationCode === '123456') {
        setStep(3);
      } else {
        setError('Invalid verification code. Please try again.');
      }
    } catch (err) {
      setError('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = () => {
    onComplete?.({
      secretKey,
      backupCodes,
      enabled: true
    });
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  return (
    <Card className={className} {...props}>
      <Card.Header>
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-100 rounded-full">
            <Icon name="check" className="text-green-600" size="md" />
          </div>
          <div>
            <Typography variant="h5">Two-Factor Authentication</Typography>
            <Typography variant="body2" className="text-gray-600">
              Add an extra layer of security to your account
            </Typography>
          </div>
        </div>
      </Card.Header>

      <Card.Content>
        {/* Progress Indicator */}
        <div className="mb-6">
          <div className="flex items-center">
            {[1, 2, 3].map((stepNumber) => (
              <React.Fragment key={stepNumber}>
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  step >= stepNumber ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {step > stepNumber ? <Icon name="check" size="sm" /> : stepNumber}
                </div>
                {stepNumber < 3 && (
                  <div className={`flex-1 h-1 mx-2 ${step > stepNumber ? 'bg-green-600' : 'bg-gray-200'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            <Typography variant="caption" className="text-gray-500">Setup</Typography>
            <Typography variant="caption" className="text-gray-500">Verify</Typography>
            <Typography variant="caption" className="text-gray-500">Backup</Typography>
          </div>
        </div>

        {/* Step 1: Setup Authenticator */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <Typography variant="h6" className="mb-2">
                Step 1: Install an Authenticator App
              </Typography>
              <Typography variant="body2" className="text-gray-600 mb-4">
                Download and install an authenticator app on your mobile device:
              </Typography>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 border border-gray-200 rounded-lg text-center">
                  <Typography variant="body2" className="font-medium">Google Authenticator</Typography>
                  <Typography variant="caption" className="text-gray-500">iOS & Android</Typography>
                </div>
                <div className="p-3 border border-gray-200 rounded-lg text-center">
                  <Typography variant="body2" className="font-medium">Authy</Typography>
                  <Typography variant="caption" className="text-gray-500">iOS & Android</Typography>
                </div>
                <div className="p-3 border border-gray-200 rounded-lg text-center">
                  <Typography variant="body2" className="font-medium">1Password</Typography>
                  <Typography variant="caption" className="text-gray-500">iOS & Android</Typography>
                </div>
              </div>
            </div>

            <div>
              <Typography variant="h6" className="mb-2">
                Step 2: Scan QR Code
              </Typography>
              <Typography variant="body2" className="text-gray-600 mb-4">
                Open your authenticator app and scan this QR code:
              </Typography>
              
              <div className="flex flex-col items-center space-y-4">
                <div className="p-4 bg-white border-2 border-gray-200 rounded-lg">
                  <img 
                    src={qrCode} 
                    alt="QR Code for 2FA setup" 
                    className="w-48 h-48 bg-gray-100"
                  />
                </div>
                
                <div className="text-center">
                  <Typography variant="body2" className="text-gray-600 mb-2">
                    Can't scan? Enter this code manually:
                  </Typography>
                  <div className="flex items-center space-x-2">
                    <code className="px-3 py-1 bg-gray-100 rounded text-sm font-mono">
                      {secretKey}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(secretKey)}
                    >
                      <Icon name="settings" size="sm" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <Button onClick={() => setStep(2)} fullWidth>
              Continue to Verification
            </Button>
          </div>
        )}

        {/* Step 2: Verify Code */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <Typography variant="h6" className="mb-2">
                Step 3: Verify Setup
              </Typography>
              <Typography variant="body2" className="text-gray-600 mb-4">
                Enter the 6-digit code from your authenticator app to verify the setup:
              </Typography>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-center">
                <Icon name="warning" className="text-red-500 mr-2" size="sm" />
                <Typography variant="body2" className="text-red-700">
                  {error}
                </Typography>
              </div>
            )}

            <div className="max-w-xs mx-auto">
              <FormField
                label="Verification Code"
                type="text"
                value={verificationCode}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setVerificationCode(value);
                  setError('');
                }}
                placeholder="123456"
                className="text-center text-2xl tracking-widest"
                maxLength={6}
                autoComplete="off"
              />
            </div>

            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                onClick={handleVerifyCode}
                loading={loading}
                disabled={verificationCode.length !== 6}
                className="flex-1"
              >
                Verify Code
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Backup Codes */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <Typography variant="h6" className="mb-2">
                Step 4: Save Backup Codes
              </Typography>
              <Typography variant="body2" className="text-gray-600 mb-4">
                Save these backup codes in a secure location. You can use them to access your account if you lose your authenticator device:
              </Typography>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-2">
                {backupCodes.map((code, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                    <code className="text-sm font-mono">{code}</code>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 flex justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(backupCodes.join('\n'))}
                >
                  <Icon name="settings" className="mr-2" size="sm" />
                  Copy All Codes
                </Button>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <div className="flex">
                <Icon name="warning" className="text-yellow-600 mr-2 mt-0.5" size="sm" />
                <div>
                  <Typography variant="body2" className="text-yellow-800 font-medium">
                    Important Security Notes:
                  </Typography>
                  <ul className="mt-1 text-sm text-yellow-700 list-disc list-inside space-y-1">
                    <li>Each backup code can only be used once</li>
                    <li>Store these codes in a secure, offline location</li>
                    <li>Don't share these codes with anyone</li>
                    <li>Generate new codes if these are compromised</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={onCancel}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleComplete}
                className="flex-1"
              >
                Complete Setup
              </Button>
            </div>
          </div>
        )}
      </Card.Content>
    </Card>
  );
};

TwoFactorSetup.propTypes = {
  onComplete: PropTypes.func,
  onCancel: PropTypes.func,
  className: PropTypes.string
};

export default TwoFactorSetup;