import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye, 
  Download, 
  RefreshCw,
  AlertTriangle,
  User,
  CreditCard,
  Calendar,
  Building2,
  Search,
  Filter,
  ArrowRight
} from 'lucide-react';
import { paymentAPI, PendingTransferProof, PendingTransferProofsResponse, TransferVerificationData } from '../../../services/hallPayment';

const TransferVerification: React.FC = () => {
  const [pendingTransfers, setPendingTransfers] = useState<PendingTransferProof[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransfer, setSelectedTransfer] = useState<PendingTransferProof | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [verifying, setVerifying] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchPendingTransfers();
  }, [page]);

  const fetchPendingTransfers = async () => {
    try {
      setLoading(true);
      const response: PendingTransferProofsResponse = await paymentAPI.getPendingTransferProofs({
        page,
        limit: 10
      });
      
      if (response.success) {
        setPendingTransfers(response.pendingProofs);
        setTotal(response.total);
        setTotalPages(response.totalPages);
      }
    } catch (error) {
      console.error('Error fetching pending transfers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyTransfer = async (transactionId: string, action: 'approve' | 'reject', reason?: string) => {
    try {
      setVerifying(transactionId);
      const verificationData: TransferVerificationData = {
        action,
        rejectionReason: reason
      };
      
      await paymentAPI.verifyTransferPayment(transactionId, verificationData);
      
      await fetchPendingTransfers();
      
      if (selectedTransfer?.transactionId === transactionId) {
        setShowDetails(false);
        setSelectedTransfer(null);
      }
    } catch (error) {
      console.error('Error verifying transfer:', error);
      alert('Failed to verify transfer. Please try again.');
    } finally {
      setVerifying(null);
    }
  };

  const viewTransferDetails = (transfer: PendingTransferProof) => {
    setSelectedTransfer(transfer);
    setShowDetails(true);
  };

  const downloadProof = (proofUrl: string, transactionId: string) => {
    const link = document.createElement('a');
    link.href = proofUrl;
    link.download = `transfer-proof-${transactionId}`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      const filtered = pendingTransfers.filter(transfer => 
        transfer.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transfer.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transfer.transactionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transfer.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setPendingTransfers(filtered);
    } else {
      fetchPendingTransfers();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Stats Section - No Cards */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-lg mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-6">
            <div className="border-b sm:border-b-0 sm:border-r border-gray-100 pb-6 sm:pb-0 sm:pr-6">
              <p className="text-gray-500 text-sm mb-2">Pending Verifications</p>
              <p className="text-3xl sm:text-4xl font-bold text-gray-900 break-words">
                {total}
              </p>
              <p className="text-red-600 text-xs mt-2">Awaiting review</p>
            </div>

            <div className="border-b sm:border-b-0 sm:border-r border-gray-100 pb-6 sm:pb-0 sm:pr-6">
              <p className="text-gray-500 text-sm mb-2">Total Amount</p>
              <p className="text-3xl sm:text-4xl font-bold text-gray-900 break-words">
                {paymentAPI.formatCurrency(
                  pendingTransfers.reduce((sum, transfer) => sum + transfer.amount, 0)
                )}
              </p>
              <p className="text-red-600 text-xs mt-2">Pending verification</p>
            </div>

            <div>
              <p className="text-gray-500 text-sm mb-2">Average Amount</p>
              <p className="text-3xl sm:text-4xl font-bold text-gray-900 break-words">
                {pendingTransfers.length > 0 
                  ? paymentAPI.formatCurrency(
                      pendingTransfers.reduce((sum, transfer) => sum + transfer.amount, 0) / pendingTransfers.length
                    )
                  : paymentAPI.formatCurrency(0)
                }
              </p>
              <p className="text-red-600 text-xs mt-2">Per transfer</p>
            </div>
          </div>
        </div>

        {/* Search and Actions Bar */}
        <div className="bg-white rounded-3xl shadow-lg p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex-1 w-full">
              <div className="relative max-w-2xl">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by customer name, email, transaction ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-3 w-full lg:w-auto">
              <button
                onClick={handleSearch}
                className="flex-1 lg:flex-none px-6 py-3 bg-red-600 text-white rounded-2xl hover:bg-red-700 flex items-center gap-2 transition-colors"
              >
                <Search className="w-4 h-4" />
                Search
              </button>
              
              <button
                onClick={fetchPendingTransfers}
                disabled={loading}
                className="flex-1 lg:flex-none px-4 py-3 border border-gray-300 rounded-2xl bg-white hover:bg-gray-50 flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Transfers List */}
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
          {pendingTransfers.length === 0 ? (
            <div className="p-12 text-center">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">All caught up!</h3>
              <p className="text-gray-500">No pending transfer verifications at the moment.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {pendingTransfers.map((transfer) => (
                <div key={transfer.transactionId} className="p-6 hover:bg-gray-50 transition-colors group">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                          <Building2 className="w-6 h-6 text-red-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3">
                            <h3 className="text-lg font-semibold text-gray-900 truncate group-hover:text-red-600 transition-colors">
                              {transfer.customerName}
                            </h3>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                              Pending Verification
                            </span>
                          </div>
                          <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                            <span className="flex items-center space-x-1">
                              <User className="w-4 h-4" />
                              <span>{transfer.customerEmail}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>{paymentAPI.formatRelativeTime(transfer.uploadedAt)}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Building2 className="w-4 h-4" />
                              <span>{transfer.hallName}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6">
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">
                          {paymentAPI.formatCurrency(transfer.amount)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {transfer.transactionId}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => viewTransferDetails(transfer)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => downloadProof(transfer.transferProofUrl, transfer.transactionId)}
                          className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                          title="Download Proof"
                        >
                          <Download className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleVerifyTransfer(transfer.transactionId, 'approve')}
                          disabled={verifying === transfer.transactionId}
                          className="flex items-center space-x-1 px-3 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => {
                            const reason = prompt('Rejection reason (optional):');
                            if (reason !== null) {
                              handleVerifyTransfer(transfer.transactionId, 'reject', reason);
                            }
                          }}
                          disabled={verifying === transfer.transactionId}
                          className="flex items-center space-x-1 px-3 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Reject</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Event Dates */}
                  {transfer.eventDates && transfer.eventDates.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="text-sm text-gray-600 mb-2">Event Dates:</div>
                      <div className="flex flex-wrap gap-2">
                        {transfer.eventDates.map((date, index) => (
                          <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            {paymentAPI.formatDate(date)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {(page - 1) * 10 + 1} to {Math.min(page * 10, total)} of {total} results
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page <= 1}
                  className="px-4 py-2 border border-gray-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600 px-4">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page >= totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Transfer Details Modal */}
      {showDetails && selectedTransfer && (
        <TransferDetailsModal
          transfer={selectedTransfer}
          onClose={() => {
            setShowDetails(false);
            setSelectedTransfer(null);
          }}
          onVerify={handleVerifyTransfer}
          isVerifying={verifying === selectedTransfer.transactionId}
        />
      )}
    </div>
  );
};

// Transfer Details Modal Component
const TransferDetailsModal: React.FC<{
  transfer: PendingTransferProof;
  onClose: () => void;
  onVerify: (transactionId: string, action: 'approve' | 'reject', reason?: string) => void;
  isVerifying: boolean;
}> = ({ transfer, onClose, onVerify, isVerifying }) => {
  const [showFullImage, setShowFullImage] = useState(false);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Transfer Verification</h2>
            <p className="text-gray-600 mt-1">{transfer.transactionId}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Payment Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-red-50 rounded-2xl p-6">
              <div className="text-sm text-gray-600 mb-2">Transfer Amount</div>
              <div className="text-3xl font-bold text-red-600">
                {paymentAPI.formatCurrency(transfer.amount)}
              </div>
            </div>
            <div className="bg-yellow-50 rounded-2xl p-6">
              <div className="text-sm text-gray-600 mb-2">Status</div>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                Pending Verification
              </span>
            </div>
            <div className="bg-purple-50 rounded-2xl p-6">
              <div className="text-sm text-gray-600 mb-2">Submitted</div>
              <div className="text-lg font-semibold text-gray-900">
                {paymentAPI.formatRelativeTime(transfer.uploadedAt)}
              </div>
              <div className="text-sm text-gray-500">
                {new Date(transfer.uploadedAt).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
          </div>

          {/* Customer & Booking Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <User className="w-5 h-5 text-red-600" />
                <span>Customer Information</span>
              </h3>
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-gray-600">Name</div>
                  <div className="font-medium text-lg">{transfer.customerName}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Email</div>
                  <div className="font-medium">{transfer.customerEmail}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Hall</div>
                  <div className="font-medium">{transfer.hallName}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Booking ID</div>
                  <div className="font-medium text-sm">{transfer.bookingId}</div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-purple-600" />
                <span>Event Details</span>
              </h3>
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-gray-600 mb-2">Event Dates:</div>
                  <div className="space-y-1">
                    {transfer.eventDates.map((date, index) => (
                      <div key={index} className="bg-white px-3 py-2 rounded-lg text-sm font-medium">
                        {paymentAPI.formatDate(date)}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Payment Status</div>
                  <div className="font-medium">{transfer.paymentStatus}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Transfer Proof */}
          <div className="bg-white border-2 border-gray-200 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Transfer Proof</h3>
            <div className="relative">
              <img
                src={transfer.transferProofUrl}
                alt="Transfer Proof"
                className="w-full max-w-2xl mx-auto rounded-xl border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => setShowFullImage(true)}
              />
              <button
                onClick={() => setShowFullImage(true)}
                className="absolute top-4 right-4 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-lg p-2 transition-all"
              >
                <Eye className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-3 text-center">
              Click image to view full size
            </p>
          </div>

          {/* Verification Actions */}
          <div className="bg-gray-50 rounded-2xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <h3 className="text-lg font-semibold text-gray-900">Verification Required</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Please review the transfer proof and customer details carefully before making a decision.
              Approved transfers will automatically update the booking status to confirmed.
            </p>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => onVerify(transfer.transactionId, 'approve')}
                disabled={isVerifying}
                className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCircle className="w-5 h-5" />
                <span>{isVerifying ? 'Approving...' : 'Approve Transfer'}</span>
              </button>
              <button
                onClick={() => {
                  const reason = prompt('Please provide a reason for rejection (optional):');
                  if (reason !== null) {
                    onVerify(transfer.transactionId, 'reject', reason);
                  }
                }}
                disabled={isVerifying}
                className="flex items-center space-x-2 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <XCircle className="w-5 h-5" />
                <span>Reject Transfer</span>
              </button>
              <button
                onClick={onClose}
                className="px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>

        {/* Full Image Modal */}
        {showFullImage && (
          <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-60">
            <div className="relative max-w-full max-h-full">
              <button
                onClick={() => setShowFullImage(false)}
                className="absolute top-4 right-4 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-full p-2 transition-all"
              >
                <XCircle className="w-6 h-6" />
              </button>
              <img
                src={transfer.transferProofUrl}
                alt="Transfer Proof - Full Size"
                className="max-w-full max-h-full object-contain rounded-lg"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransferVerification;