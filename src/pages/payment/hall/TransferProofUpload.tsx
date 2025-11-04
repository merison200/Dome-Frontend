import React, { useState, useRef } from 'react';
import { Upload, FileImage, CheckCircle, X, AlertTriangle, Loader } from 'lucide-react';
import { paymentAPI } from '../../../services/hallPayment';

interface TransferProofUploadProps {
  isOpen: boolean;
  onClose: () => void;
  transactionId: string;
  transferDetails: {
    accountName: string;
    accountNumber: string;
    bankName: string;
  };
  amount: number;
  onSuccess: () => void;
}

const TransferProofUpload: React.FC<TransferProofUploadProps> = ({
  isOpen,
  onClose,
  transactionId,
  transferDetails,
  amount,
  onSuccess
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      setSelectedFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    try {
      const result = await paymentAPI.uploadTransferProof(transactionId, selectedFile);
      
      if (result.success) {
        setUploadSuccess(true);
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 2000);
      } else {
        alert(result.message || 'Upload failed');
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      alert('Failed to upload proof. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      // Create a mock FileList for compatibility
      const dt = new DataTransfer();
      dt.items.add(file);
      
      const event = {
        target: { files: dt.files }
      } as React.ChangeEvent<HTMLInputElement>;
      handleFileSelect(event);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Upload Transfer Proof</h2>
          <button
            onClick={onClose}
            disabled={uploading}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {uploadSuccess ? (
            /* Success State */
            <div className="text-center py-8">
              <CheckCircle className="w-20 h-20 text-green-600 dark:text-green-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-green-900 dark:text-green-200 mb-4">Upload Successful!</h3>
              <p className="text-green-800 dark:text-green-300 mb-6">
                Your transfer proof has been submitted. We'll verify your payment within 24 hours.
              </p>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-4">
                <p className="text-sm text-green-800 dark:text-green-300">
                  You'll receive an email confirmation once your payment is verified.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Transfer Instructions */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6 mb-6">
                <h3 className="text-lg font-bold text-blue-900 dark:text-blue-200 mb-4">Transfer Details</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-700 dark:text-blue-300">Account Name:</span>
                    <span className="font-semibold text-blue-900 dark:text-blue-200">{transferDetails.accountName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700 dark:text-blue-300">Account Number:</span>
                    <span className="font-semibold text-blue-900 dark:text-blue-200">{transferDetails.accountNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700 dark:text-blue-300">Bank Name:</span>
                    <span className="font-semibold text-blue-900 dark:text-blue-200">{transferDetails.bankName}</span>
                  </div>
                  <div className="flex justify-between border-t border-blue-200 dark:border-blue-700 pt-3">
                    <span className="text-blue-700 dark:text-blue-300">Amount:</span>
                    <span className="font-bold text-lg text-blue-900 dark:text-blue-200">
                      {paymentAPI.formatCurrency(amount)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Important Instructions */}
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-2xl p-6 mb-6">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-yellow-900 dark:text-yellow-200 mb-2">Before Uploading</h4>
                    <ul className="text-sm text-yellow-800 dark:text-yellow-300 space-y-1">
                      <li>• Ensure you've completed the bank transfer</li>
                      <li>• Upload a clear screenshot or photo of your transfer receipt</li>
                      <li>• Make sure the amount, account details, and reference are visible</li>
                      <li>• Supported formats: JPG, PNG, GIF (max 5MB)</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* File Upload Area */}
              <div className="mb-6">
                <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Upload Transfer Receipt</h4>
                
                {!selectedFile ? (
                  <div
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl p-8 text-center cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-300"
                  >
                    <Upload className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                    <div className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Click to upload or drag and drop
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Upload a screenshot of your transfer receipt
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-500">
                      Supported: JPG, PNG, GIF • Max size: 5MB
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-green-300 dark:border-green-600 rounded-2xl p-6 bg-green-50 dark:bg-green-900/20">
                    <div className="flex items-start space-x-4">
                      {preview && (
                        <div className="flex-shrink-0">
                          <img
                            src={preview}
                            alt="Transfer proof preview"
                            className="w-24 h-24 object-cover rounded-xl border border-gray-200 dark:border-gray-600"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <FileImage className="w-5 h-5 text-green-600 dark:text-green-400" />
                          <span className="font-semibold text-green-900 dark:text-green-200 truncate">
                            {selectedFile.name}
                          </span>
                        </div>
                        <div className="text-sm text-green-700 dark:text-green-300 mb-3">
                          Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </div>
                        <button
                          onClick={clearFile}
                          className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm font-medium flex items-center space-x-1"
                        >
                          <X className="w-4 h-4" />
                          <span>Remove file</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              {/* Verification Timeline */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-6 mb-6">
                <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">What Happens Next?</h4>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                      1
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">Upload Receipt</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Submit your transfer proof</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                      2
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">Manual Verification</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">We verify your payment (within 24 hours)</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                      3
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">Booking Confirmed</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">You'll receive confirmation email</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Upload Button */}
              <div className="flex space-x-4">
                <button
                  onClick={handleUpload}
                  disabled={!selectedFile || uploading}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      <span>Submit Proof</span>
                    </>
                  )}
                </button>
                <button
                  onClick={onClose}
                  disabled={uploading}
                  className="px-6 py-4 bg-gray-600 dark:bg-gray-700 text-white rounded-xl font-semibold hover:bg-gray-700 dark:hover:bg-gray-600 transition-all duration-300 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>

              {/* Help Text */}
              <div className="mt-6 bg-gray-50 dark:bg-gray-700 rounded-2xl p-4">
                <h5 className="font-semibold text-gray-900 dark:text-white mb-2">Need Help?</h5>
                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <div>• Take a clear photo of your mobile banking receipt</div>
                  <div>• Ensure transaction details are clearly visible</div>
                  <div>• Include the full bank receipt showing amount and account details</div>
                  <div>• Contact officialdomeakure@gmail.com if you encounter issues</div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransferProofUpload;