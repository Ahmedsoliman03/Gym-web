'use client';

import { useState, useCallback } from 'react';
import axios from 'axios';
import { api } from '@/utils/axios';

export type FileType = 'gym_photo' | 'profile_photo' | 'community_post' | 'chat_file' | 'cv' | 'license' | 'certification';

interface UploadResponseUrl {
    uploadUrl: string;
    filePath: string;
    isPrivate: boolean;
}

interface UploadUrlResponse {
    urls: UploadResponseUrl[];
}

export function useR2Upload() {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const uploadFile = useCallback(async (
        file: File,
        fileType: FileType,
        onProgress?: (percent: number) => void
    ): Promise<string> => {
        setIsUploading(true);
        setUploadProgress(0);
        onProgress?.(0);
        setError(null);

        try {
            // Step 1: Request upload URL from the backend
            const payload = {
                files: [
                    {
                        filename: file.name,
                        fileType: fileType,
                        contentType: file.type || 'application/octet-stream',
                    }
                ]
            };

            const response = await api.post<UploadUrlResponse>('/api/core/uploads/generate/', payload);

            if (!response.data?.urls?.length) {
                throw new Error("Failed to generate upload URL");
            }

            const { uploadUrl, filePath } = response.data.urls[0];

            // Step 2: Upload Directly to Cloudflare (with Progress)
            // Using standard axios instance to avoid custom headers/interceptors that might break R2 CORS
            await axios.put(uploadUrl, file, {
                headers: {
                    'Content-Type': file.type || 'application/octet-stream',
                },
                onUploadProgress: (progressEvent) => {
                    if (progressEvent.total) {
                        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        setUploadProgress(percentCompleted);
                        onProgress?.(percentCompleted);
                    }
                }
            });

            setIsUploading(false);
            setUploadProgress(100);
            onProgress?.(100);
            return filePath;
        } catch (err: any) {
            console.error("Upload failed", err);
            setError(err?.response?.data?.message || err.message || "Failed to upload file");
            setIsUploading(false);
            setUploadProgress(0);
            throw err;
        }
    }, []);

    const uploadMultipleFiles = useCallback(async (
        files: File[],
        fileType: FileType,
        onProgress?: (percent: number) => void
    ): Promise<string[]> => {
        setIsUploading(true);
        setUploadProgress(0);
        onProgress?.(0);
        setError(null);
        
        try {
            // Step 1: Request upload URLs for all files
            const payload = {
                files: files.map(file => ({
                    filename: file.name,
                    fileType: fileType,
                    contentType: file.type || 'application/octet-stream',
                }))
            };

            const response = await api.post<UploadUrlResponse>('/api/core/uploads/generate/', payload);
            
            if (!response.data?.urls?.length || response.data.urls.length !== files.length) {
                throw new Error("Failed to generate upload URLs for all files");
            }

            const filePaths: string[] = [];
            const totalBytesLoaded = new Array(files.length).fill(0);
            const totalBytes = files.reduce((acc, file) => acc + file.size, 0);

            // Step 2: Upload all files concurrently
            const uploadPromises = files.map((file, index) => {
                const { uploadUrl, filePath } = response.data.urls[index];
                filePaths.push(filePath);

                return axios.put(uploadUrl, file, {
                    headers: {
                        'Content-Type': file.type || 'application/octet-stream',
                    },
                    onUploadProgress: (progressEvent) => {
                        totalBytesLoaded[index] = progressEvent.loaded;
                        const totalLoaded = totalBytesLoaded.reduce((acc, loaded) => acc + loaded, 0);
                        if (totalBytes > 0) {
                            const percentCompleted = Math.round((totalLoaded * 100) / totalBytes);
                            setUploadProgress(percentCompleted);
                            onProgress?.(percentCompleted);
                        }
                    }
                });
            });

            await Promise.all(uploadPromises);

            setIsUploading(false);
            setUploadProgress(100);
            onProgress?.(100);
            return filePaths;
        } catch (err: any) {
            console.error("Upload multiple failed", err);
            setError(err?.response?.data?.message || err.message || "Failed to upload files");
            setIsUploading(false);
            setUploadProgress(0);
            throw err;
        }
    }, []);

    return {
        uploadFile,
        uploadMultipleFiles,
        isUploading,
        uploadProgress,
        error
    };
}
