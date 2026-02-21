'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Folder, Image as ImageIcon, FileText, Video, UploadCloud, Plus, Search, Download, Trash2, ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';

interface MediaItem {
    id: string;
    name: string;
    type: string;
    size: string;
    url: string;
    created_at: string;
}

interface MediaFolder {
    id: string;
    name: string;
    itemCount: number;
}

export default function MediaPage() {
    const supabase = createClient();
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const [files, setFiles] = useState<MediaItem[]>([]);
    const [folders, setFolders] = useState<MediaFolder[]>([]);
    const [currentFolder, setCurrentFolder] = useState<string>('root');
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const loadData = async () => {
        setLoading(true);
        try {
            const folderPath = currentFolder === 'root' ? '' : `${currentFolder}/`;
            
            const { data, error } = await supabase.storage
                .from('cms')
                .list(folderPath, {
                    limit: 100,
                    offset: 0,
                    sortBy: { column: 'name', order: 'asc' },
                });

            if (error) {
                console.error('Error loading media:', error);
                setFiles([]);
                setFolders([]);
            } else {
                const folderList: MediaFolder[] = [];
                const fileList: MediaItem[] = [];

                for (const item of data || []) {
                    if (item.metadata?.isFolder || item.name.endsWith('/')) {
                        const folderName = item.name.replace('/', '');
                        folderList.push({
                            id: item.name,
                            name: folderName,
                            itemCount: 0
                        });
                    } else {
                        const { data: { publicUrl } } = supabase.storage
                            .from('cms')
                            .getPublicUrl(`${folderPath}${item.name}`);
                        
                        fileList.push({
                            id: item.id || item.name,
                            name: item.name,
                            type: getFileType(item.name),
                            size: formatFileSize(item.metadata?.size || 0),
                            url: publicUrl,
                            created_at: item.created_at || ''
                        });
                    }
                }

                setFolders(folderList);
                setFiles(fileList);
            }
        } catch (error) {
            console.error('Error:', error);
            setFiles([]);
            setFolders([]);
        }
        setLoading(false);
    };

    useEffect(() => { loadData(); }, [currentFolder]);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);
        try {
            for (const file of Array.from(files)) {
                const fileExt = file.name.split('.').pop();
                const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
                const filePath = currentFolder === 'root' ? fileName : `${currentFolder}/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('cms')
                    .upload(filePath, file, {
                        cacheControl: '3600',
                        upsert: false,
                    });

                if (uploadError) {
                    toast.error(`Failed to upload ${file.name}`);
                    console.error('Upload error:', uploadError);
                } else {
                    toast.success(`${file.name} uploaded`);
                }
            }
            loadData();
        } catch (error) {
            toast.error('Upload failed');
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleDelete = async (file: MediaItem) => {
        if (!confirm(`Delete ${file.name}?`)) return;
        
        try {
            const { error } = await supabase.storage
                .from('cms')
                .remove([file.name]);

            if (error) {
                toast.error('Delete failed');
            } else {
                toast.success('File deleted');
                loadData();
            }
        } catch (error) {
            toast.error('Delete failed');
        }
    };

    const handleCreateFolder = async () => {
        const name = prompt("Folder Name:");
        if (!name) return;

        try {
            const { error } = await supabase.storage
                .from('cms')
                .upload(`${name}/.folder-placeholder`, new Blob(['']), {
                    contentType: 'application/octet-stream'
                });

            if (error) {
                toast.error('Failed to create folder');
            } else {
                toast.success('Folder created');
                loadData();
            }
        } catch (error) {
            toast.error('Failed to create folder');
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'image': return <ImageIcon className="h-8 w-8 text-purple-400" />;
            case 'video': return <Video className="h-8 w-8 text-pink-400" />;
            case 'document': return <FileText className="h-8 w-8 text-blue-400" />;
            default: return <FileText className="h-8 w-8 text-zinc-400" />;
        }
    };

    const getFileType = (fileName: string): string => {
        const ext = fileName.split('.').pop()?.toLowerCase() || '';
        if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) return 'image';
        if (['mp4', 'webm', 'mov', 'avi'].includes(ext)) return 'video';
        if (['pdf', 'doc', 'docx', 'txt'].includes(ext)) return 'document';
        return 'other';
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const filteredFiles = files.filter(f => 
        f.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    {currentFolder !== 'root' && (
                        <Button variant="ghost" size="icon" onClick={() => setCurrentFolder('root')} className="hover:bg-slate-100 text-slate-600">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    )}
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                            Media Library {currentFolder !== 'root' && <span className="text-slate-400 text-lg font-normal">/ {currentFolder}</span>}
                        </h1>
                        <p className="text-slate-500 text-sm">Manage images and documents.</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="border-slate-200 text-slate-600 hover:bg-slate-50" onClick={handleCreateFolder}>
                        <Plus className="mr-2 h-4 w-4" /> New Folder
                    </Button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        multiple
                        className="hidden"
                        accept="image/*,video/*,.pdf,.doc,.docx,.txt"
                    />
                    <Button 
                        className="bg-teal-600 hover:bg-teal-700 text-white" 
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                    >
                        {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
                        {uploading ? 'Uploading...' : 'Upload'}
                    </Button>
                </div>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                    placeholder="Search files..."
                    className="pl-10 bg-white border-slate-200"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {folders.map(folder => (
                        <Card key={folder.id} className="bg-white border-slate-200 hover:bg-slate-50 hover:border-teal-200 hover:shadow-md cursor-pointer transition-all shadow-sm" onClick={() => setCurrentFolder(folder.id)}>
                            <CardContent className="p-4 flex flex-col items-center justify-center text-center h-40 gap-2">
                                <Folder className="h-12 w-12 text-teal-400 fill-teal-50" />
                                <div className="font-medium text-slate-800 text-sm truncate w-full">{folder.name}</div>
                            </CardContent>
                        </Card>
                    ))}

                    {filteredFiles.map(file => (
                        <Card key={file.id} className="bg-white border-slate-200 hover:border-teal-200 hover:shadow-md group relative shadow-sm">
                            <CardContent className="p-4 flex flex-col items-center justify-center text-center h-40 gap-2">
                                {file.type === 'image' ? (
                                    <img src={file.url} alt={file.name} className="h-16 w-16 object-cover rounded" />
                                ) : (
                                    getIcon(file.type)
                                )}
                                <div className="font-medium text-slate-800 text-xs truncate w-full">{file.name}</div>
                                <div className="text-xs text-slate-400">{file.size}</div>
                            </CardContent>

                            <div className="absolute inset-0 bg-white/90 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 rounded-xl border border-teal-200">
                                <Button 
                                    size="icon" 
                                    variant="secondary" 
                                    className="h-8 w-8 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200"
                                    onClick={() => window.open(file.url, '_blank')}
                                >
                                    <Download className="h-4 w-4" />
                                </Button>
                                <Button 
                                    size="icon" 
                                    variant="destructive" 
                                    className="h-8 w-8 rounded-full bg-rose-50 text-rose-500 hover:bg-rose-100"
                                    onClick={() => handleDelete(file)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {files.length === 0 && folders.length === 0 && !loading && (
                <div className="text-center py-20 text-slate-400">
                    <div className="p-4 rounded-full bg-slate-50 inline-block mb-4 border border-slate-100">
                        <UploadCloud className="h-8 w-8 text-slate-300" />
                    </div>
                    <p>Folder is empty.</p>
                </div>
            )}
        </div>
    );
}
