'use client';

import { useState, useEffect } from 'react';
import { User, MOCK_USERS } from '@/app/lib/mock/users-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Edit2, Mail, Trash2, Clock, Shield, Activity, UserX, UserCheck } from 'lucide-react';
import { toast } from 'sonner';

export default function UserProfilePage({ params }: { params: { id: string } }) {
    const [user, setUser] = useState<User | null>(null);
    const [activeTab, setActiveTab] = useState('profile');

    useEffect(() => {
        // Mock fetch
        const found = MOCK_USERS.find(u => u.id === params.id) || MOCK_USERS[0];
        setUser(found);
    }, [params.id]);

    if (!user) return <div className="p-8 text-zinc-500">Loading profile...</div>;

    const handleAction = (action: string) => {
        toast.info(`Mock Action: ${action}`);
    };

    return (
        <div className="space-y-6 animate-in fade-in py-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row gap-6 bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
                <Avatar className="h-24 w-24 border-2 border-zinc-700">
                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`} />
                    <AvatarFallback className="text-2xl bg-zinc-800 text-zinc-400">{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-2">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-1">{user.name}</h1>
                            <div className="flex items-center gap-3">
                                <Badge variant="outline" className="bg-zinc-950 text-zinc-400 border-zinc-700">{user.id}</Badge>
                                <Badge className={
                                    user.type === 'Admin' ? 'bg-purple-900/50 text-purple-400' :
                                        user.type === 'Employee' ? 'bg-blue-900/50 text-blue-400' :
                                            'bg-teal-900/50 text-teal-400'
                                }>
                                    {user.type}
                                </Badge>
                                <Badge variant="outline" className={user.status === 'active' ? 'text-green-500 border-green-900' : 'text-red-500 border-red-900'}>
                                    {user.status === 'active' ? 'Active' : 'Inactive'}
                                </Badge>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" className="border-zinc-700 bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700" onClick={() => handleAction('Edit')}>
                                <Edit2 className="mr-2 h-4 w-4" /> Edit
                            </Button>
                            <Button variant="outline" className="border-zinc-700 bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700" onClick={() => handleAction('Email')}>
                                <Mail className="mr-2 h-4 w-4" /> Email
                            </Button>
                            {user.status === 'active' ? (
                                <Button variant="ghost" size="icon" className="text-red-400 hover:bg-red-900/10" title="Deactivate" onClick={() => handleAction('Deactivate')}>
                                    <UserX className="h-5 w-5" />
                                </Button>
                            ) : (
                                <Button variant="ghost" size="icon" className="text-green-400 hover:bg-green-900/10" title="Activate" onClick={() => handleAction('Activate')}>
                                    <UserCheck className="h-5 w-5" />
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-6 pt-2 text-sm text-zinc-400">
                        <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-zinc-600" /> {user.email}
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-zinc-600" /> Joined {user.joinedDate}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="bg-zinc-900 text-zinc-400 border border-zinc-800 w-full justify-start h-12">
                    <TabsTrigger value="profile" className="px-6 data-[state=active]:bg-zinc-800 data-[state=active]:text-white">Profile Details</TabsTrigger>
                    <TabsTrigger value="activity" className="px-6 data-[state=active]:bg-zinc-800 data-[state=active]:text-white">Activity Log</TabsTrigger>
                    <TabsTrigger value="permissions" className="px-6 data-[state=active]:bg-zinc-800 data-[state=active]:text-white">Permissions</TabsTrigger>
                </TabsList>

                {/* PROFILE TAB */}
                <TabsContent value="profile" className="space-y-6 mt-6 animate-in slide-in-from-bottom-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="bg-zinc-900 border-zinc-800">
                            <CardHeader><CardTitle className="text-lg">Personal Information</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <Row label="Full Name" value={user.name} />
                                <Row label="Date of Birth" value={user.dob || 'N/A'} />
                                <Row label="Gender" value={user.gender || 'N/A'} />
                                <Row label="Address" value={user.address || 'N/A'} />
                                <Row label="City / State" value={`${user.city || '-'}, ${user.state || '-'}`} />
                            </CardContent>
                        </Card>

                        {(user.type === 'Employee' || user.type === 'Referral Partner') && (
                            <Card className="bg-zinc-900 border-zinc-800">
                                <CardHeader><CardTitle className="text-lg">Professional Details</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    <Row label="Department" value={user.departmentId?.replace('dept_', '').toUpperCase() || 'N/A'} />
                                    <Row label="Designation" value={user.designationId?.replace('des_', '').replace('_', ' ').toUpperCase() || 'N/A'} />
                                    <Row label="Reporting Manager" value={user.reportingManagerId || 'N/A'} />
                                    <Row label="Date of Joining" value={user.dateOfJoining || 'N/A'} />
                                    {user.type === 'Referral Partner' && <Row label="Referral Code" value={user.referralCode || '-'} />}
                                </CardContent>
                            </Card>
                        )}

                        <Card className="bg-zinc-900 border-zinc-800">
                            <CardHeader><CardTitle className="text-lg">KYC & Documents</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between items-center py-2 border-b border-zinc-800/50">
                                    <span className="text-zinc-500">Aadhaar Status</span>
                                    <Badge variant="outline" className="text-green-500 border-green-900 bg-green-900/10">Verified</Badge>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-zinc-800/50">
                                    <span className="text-zinc-500">PAN Status</span>
                                    <Badge variant="outline" className="text-yellow-500 border-yellow-900 bg-yellow-900/10">Pending</Badge>
                                </div>
                                <div className="mt-4">
                                    <Button variant="link" className="text-teal-400 p-0 h-auto">View Uploaded Documents</Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* ACTIVITY TAB */}
                <TabsContent value="activity" className="mt-6 animate-in slide-in-from-bottom-2">
                    <Card className="bg-zinc-900 border-zinc-800">
                        <CardHeader><CardTitle className="text-lg">Recent Activity</CardTitle></CardHeader>
                        <CardContent>
                            <div className="space-y-8 pl-2">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div key={i} className="relative pl-6 border-l border-zinc-800">
                                        <div className="absolute -left-[5px] top-1 h-2.5 w-2.5 rounded-full bg-zinc-700 ring-4 ring-zinc-900"></div>
                                        <div className="flex justify-between mb-1">
                                            <span className="text-sm font-medium text-white">Login Successful</span>
                                            <span className="text-xs text-zinc-500">2 hours ago</span>
                                        </div>
                                        <p className="text-xs text-zinc-500">Logged in from IP 192.168.1.1 using Chrome on Windows.</p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* PERMISSIONS TAB */}
                <TabsContent value="permissions" className="mt-6 animate-in slide-in-from-bottom-2">
                    <Card className="bg-zinc-900 border-zinc-800">
                        <CardHeader>
                            <div className="flex justify-between">
                                <CardTitle className="text-lg">Assigned Permissions</CardTitle>
                                <Button size="sm" variant="outline" className="border-zinc-700">Manage Access</Button>
                            </div>
                            <CardDescription>
                                Current module access based on assigned Role ({user.type}).
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-3 gap-4">
                                {['View Dashboard', 'Manage Plans', 'View Users', 'Edit Users', 'View Reports'].map(p => (
                                    <div key={p} className="flex items-center gap-2 p-3 bg-zinc-950 rounded border border-zinc-800">
                                        <Shield className="h-4 w-4 text-teal-500" />
                                        <span className="text-sm text-zinc-300">{p}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

const Row = ({ label, value }: { label: string, value: string }) => (
    <div className="flex justify-between py-2 border-b border-zinc-800/50 last:border-0">
        <span className="text-zinc-500 text-sm">{label}</span>
        <span className="text-zinc-200 text-sm font-medium">{value}</span>
    </div>
);
