import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Eye, 
  Reply, 
  Trash2, 
  Search, 
  Clock, 
  CheckCircle, 
  XCircle,
  Send,
  User,
  RefreshCw,
  X,
  Calendar
} from 'lucide-react';
import { inquiryAPI, Inquiry, Reply as InquiryReply } from '../../../services/inquiry';
import toast from 'react-hot-toast';

const InquiryManagement: React.FC = () => {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [filteredInquiries, setFilteredInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [replyData, setReplyData] = useState({
    subject: '',
    message: '',
    repliedBy: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const data = await inquiryAPI.getAll();
      setInquiries(data);
      setFilteredInquiries(data);
    } catch (error) {
      console.error('Error fetching inquiries:', error);
      toast.error('Failed to fetch inquiries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = inquiries;

    if (searchTerm) {
      filtered = filtered.filter(inquiry =>
        inquiry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inquiry.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inquiry.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(inquiry => inquiry.status === statusFilter);
    }

    setFilteredInquiries(filtered);
  }, [inquiries, searchTerm, statusFilter]);

  useEffect(() => {
    fetchInquiries();
  }, []);

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedInquiry) return;
    
    if (!replyData.subject.trim() || !replyData.message.trim() || !replyData.repliedBy.trim()) {
      toast.error('All fields are required');
      return;
    }

    setIsSubmitting(true);

    try {
      await inquiryAPI.reply(selectedInquiry._id!, {
        subject: replyData.subject.trim(),
        message: replyData.message.trim(),
        repliedBy: replyData.repliedBy.trim()
      });

      toast.success('Reply sent successfully!');
      setShowReplyModal(false);
      setReplyData({ subject: '', message: '', repliedBy: '' });
      fetchInquiries();
    } catch (error) {
      console.error('Error sending reply:', error);
      toast.error('Failed to send reply. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: 'pending' | 'replied' | 'closed') => {
    try {
      await inquiryAPI.updateStatus(id, status);
      toast.success(`Status updated to ${status}`);
      fetchInquiries();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete the inquiry from ${name}?`)) {
      return;
    }

    try {
      await inquiryAPI.delete(id);
      toast.success('Inquiry deleted successfully');
      fetchInquiries();
    } catch (error) {
      console.error('Error deleting inquiry:', error);
      toast.error('Failed to delete inquiry');
    }
  };

  const openReplyModal = (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry);
    setReplyData({
      subject: `Re: Your inquiry about ${inquiry.message.substring(0, 50)}...`,
      message: '',
      repliedBy: ''
    });
    setShowReplyModal(true);
  };

  const openDetailsModal = (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry);
    setShowDetailsModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'replied': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-red-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-400 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Inquiry Management</h1>
          <div className="w-12 h-0.5 bg-red-600"></div>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-lg mb-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="border-b lg:border-b-0 lg:border-r border-gray-100 pb-6 lg:pb-0 lg:pr-6">
              <p className="text-gray-500 text-sm mb-2">Total Inquiries</p>
              <p className="text-3xl sm:text-4xl font-bold text-gray-900">{inquiries.length}</p>
            </div>
            <div className="border-b lg:border-b-0 lg:border-r border-gray-100 pb-6 lg:pb-0 lg:pr-6">
              <p className="text-gray-500 text-sm mb-2">Pending</p>
              <p className="text-3xl sm:text-4xl font-bold text-gray-900">
                {inquiries.filter(i => i.status === 'pending').length}
              </p>
              <p className="text-xs text-yellow-600 mt-1">Needs attention</p>
            </div>
            <div className="border-b lg:border-b-0 lg:border-r border-gray-100 pb-6 lg:pb-0 lg:pr-6">
              <p className="text-gray-500 text-sm mb-2">Replied</p>
              <p className="text-3xl sm:text-4xl font-bold text-gray-900">
                {inquiries.filter(i => i.status === 'replied').length}
              </p>
              <p className="text-xs text-green-600 mt-1">Responses sent</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm mb-2">Closed</p>
              <p className="text-3xl sm:text-4xl font-bold text-gray-900">
                {inquiries.filter(i => i.status === 'closed').length}
              </p>
              <p className="text-xs text-gray-600 mt-1">Resolved</p>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-lg mb-8">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, email or message..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent bg-white"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="replied">Replied</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>

        {/* Inquiries List */}
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
          {filteredInquiries.length === 0 ? (
            <div className="text-center py-16">
              <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No inquiries found</h3>
              <p className="text-gray-500 text-sm">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filter.'
                  : 'No inquiries have been submitted yet.'
                }
              </p>
            </div>
          ) : (
            <div className="p-6 sm:p-8 space-y-4">
              {filteredInquiries.map((inquiry) => (
                <div key={inquiry._id} className="border border-gray-200 rounded-2xl p-4 sm:p-6 hover:border-red-300 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    {/* Left - User Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="w-5 h-5 text-red-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900">{inquiry.name}</p>
                          <p className="text-sm text-gray-500 truncate">{inquiry.email}</p>
                        </div>
                      </div>
                      
                      <p className="text-gray-700 text-sm mb-3 line-clamp-2">
                        {inquiry.message}
                      </p>

                      <div className="flex flex-wrap items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(inquiry.status)}`}>
                          {inquiry.status}
                        </span>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(inquiry.createdAt!)}
                        </span>
                        {inquiry.replies && inquiry.replies.length > 0 && (
                          <span className="text-xs text-gray-500">
                            {inquiry.replies.length} {inquiry.replies.length === 1 ? 'reply' : 'replies'}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right - Actions */}
                    <div className="flex lg:flex-col gap-2 flex-shrink-0">
                      <button
                        onClick={() => openDetailsModal(inquiry)}
                        className="flex-1 lg:flex-none px-4 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors flex items-center justify-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View</span>
                      </button>
                      <button
                        onClick={() => openReplyModal(inquiry)}
                        className="flex-1 lg:flex-none px-4 py-2 text-sm text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors flex items-center justify-center gap-2"
                      >
                        <Reply className="w-4 h-4" />
                        <span>Reply</span>
                      </button>
                      <button
                        onClick={() => handleDelete(inquiry._id!, inquiry.name)}
                        className="flex-1 lg:flex-none px-4 py-2 text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors flex items-center justify-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Reply Modal */}
      {showReplyModal && selectedInquiry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Reply to Inquiry</h2>
                <button
                  onClick={() => setShowReplyModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Original Inquiry */}
              <div className="bg-gray-50 rounded-2xl p-4 mb-6">
                <p className="text-sm font-semibold text-gray-900 mb-1">{selectedInquiry.name}</p>
                <p className="text-sm text-gray-500 mb-3">{selectedInquiry.email}</p>
                <p className="text-sm text-gray-700">{selectedInquiry.message}</p>
              </div>

              {/* Reply Form */}
              <form onSubmit={handleReply} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
                  <input
                    type="text"
                    value={replyData.repliedBy}
                    onChange={(e) => setReplyData(prev => ({ ...prev, repliedBy: e.target.value }))}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-600"
                    disabled={isSubmitting}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                  <input
                    type="text"
                    value={replyData.subject}
                    onChange={(e) => setReplyData(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="Email subject"
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-600"
                    disabled={isSubmitting}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                  <textarea
                    value={replyData.message}
                    onChange={(e) => setReplyData(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Type your reply message here..."
                    rows={8}
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-600 resize-none"
                    disabled={isSubmitting}
                    required
                  />
                </div>

                <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowReplyModal(false)}
                    className="w-full sm:w-auto px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-2xl transition-colors"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-2xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Send Reply</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedInquiry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Inquiry Details</h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Customer Info */}
              <div className="bg-gray-50 rounded-2xl p-6 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900">{selectedInquiry.name}</p>
                    <p className="text-sm text-gray-500 truncate">{selectedInquiry.email}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 text-sm">
                  <span className={`px-3 py-1 rounded-full font-semibold ${getStatusColor(selectedInquiry.status)}`}>
                    {selectedInquiry.status}
                  </span>
                  <span className="text-gray-500 flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatDate(selectedInquiry.createdAt!)}
                  </span>
                </div>
              </div>

              {/* Original Message */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Message</h3>
                <div className="bg-white border border-gray-200 rounded-2xl p-4">
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedInquiry.message}</p>
                </div>
              </div>

              {/* Reply History */}
              {selectedInquiry.replies && selectedInquiry.replies.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Reply History</h3>
                  <div className="space-y-4">
                    {selectedInquiry.replies.map((reply, index) => (
                      <div key={index} className="bg-green-50 border border-green-200 rounded-2xl p-4">
                        <div className="flex justify-between items-start mb-2">
                          <p className="font-medium text-gray-900">{reply.subject}</p>
                          <span className="text-xs text-gray-500">{formatDate(reply.repliedAt)}</span>
                        </div>
                        <p className="text-gray-700 text-sm mb-2 whitespace-pre-wrap">{reply.message}</p>
                        <p className="text-xs text-gray-600">By {reply.repliedBy}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col-reverse sm:flex-row gap-3">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="w-full sm:w-auto px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-2xl transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    openReplyModal(selectedInquiry);
                  }}
                  className="w-full sm:flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-2xl transition-colors flex items-center justify-center gap-2"
                >
                  <Reply className="w-4 h-4" />
                  <span>Reply to this Inquiry</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InquiryManagement;