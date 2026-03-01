import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import AuthService from '../services/AuthService';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, UploadCloud, X, Check, AlertCircle, Loader2 } from 'lucide-react';

const ProfileAvatarUploader = ({ currentAvatarUrl, onUploadSuccess }) => {
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(currentAvatarUrl);
    const [isHovering, setIsHovering] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const fileInputRef = useRef(null);
    const currentUser = AuthService.getCurrentUser();

    useEffect(() => {
        setPreviewUrl(currentAvatarUrl);
    }, [currentAvatarUrl]);

    const handleFileSelect = (e) => {
        setError('');
        setSuccess('');
        const selectedFile = e.target.files[0];

        if (!selectedFile) return;

        // Validation
        const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!validTypes.includes(selectedFile.type)) {
            setError('Please select a JPG, PNG, or GIF image.');
            return;
        }

        if (selectedFile.size > 5 * 1024 * 1024) {
            setError('Image must be less than 5MB.');
            return;
        }

        setFile(selectedFile);

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewUrl(reader.result);
        };
        reader.readAsDataURL(selectedFile);
    };

    const handleUpload = async () => {
        if (!file) return;

        setIsUploading(true);
        setError('');

        const formData = new FormData();
        formData.append('file', file);

        try {
            await axios.post('http://localhost:8080/api/profile/avatar', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${currentUser?.token}`
                }
            });

            setSuccess('Profile avatar updated successfully!');
            setFile(null); // Clear selection after successful upload

            if (onUploadSuccess) {
                // Signal parent component to refresh global state if needed
                onUploadSuccess();
            }

            // Auto hide success message
            setTimeout(() => setSuccess(''), 3000);

        } catch (err) {
            setError(err.response?.data?.message || 'Failed to upload image. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    const cancelSelection = () => {
        setFile(null);
        setPreviewUrl(currentAvatarUrl);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="flex flex-col items-center gap-4">
            {/* Avatar Preview Area */}
            <div
                className="relative w-32 h-32 rounded-full border-4 shadow-xl flex items-center justify-center overflow-hidden cursor-pointer group transition-all"
                style={{ borderColor: 'var(--bg-elevated)', background: 'var(--bg-surface)' }}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                onClick={() => fileInputRef.current?.click()}
            >
                {previewUrl ? (
                    <img src={previewUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-primary font-black text-4xl">
                        {currentUser?.username?.charAt(0).toUpperCase()}
                    </div>
                )}

                {/* Hover Overlay */}
                <div className={`absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white transition-opacity duration-300 ${isHovering ? 'opacity-100' : 'opacity-0'}`}>
                    <Camera size={24} className="mb-1" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Change</span>
                </div>
            </div>

            {/* Hidden Input field */}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept=".jpg,.jpeg,.png,.gif"
                className="hidden"
            />

            {/* Upload Controls (only show if a new file is selected) */}
            <AnimatePresence>
                {file && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex gap-2"
                    >
                        <button
                            onClick={cancelSelection}
                            disabled={isUploading}
                            className="w-10 h-10 rounded-xl flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                        >
                            <X size={18} />
                        </button>
                        <button
                            onClick={handleUpload}
                            disabled={isUploading}
                            className="bg-primary text-white px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 disabled:opacity-50"
                        >
                            {isUploading ? <Loader2 size={16} className="animate-spin" /> : <UploadCloud size={16} />}
                            {isUploading ? 'Uploading...' : 'Save Avatar'}
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Feedback Messages */}
            <AnimatePresence>
                {error && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2 text-[10px] font-bold text-danger bg-danger/10 px-3 py-1.5 rounded-lg border border-danger/20">
                        <AlertCircle size={14} /> {error}
                    </motion.div>
                )}
                {success && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2 text-[10px] font-bold text-success bg-success/10 px-3 py-1.5 rounded-lg border border-success/20">
                        <Check size={14} /> {success}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ProfileAvatarUploader;
