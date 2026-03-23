'use client';

import { useState } from 'react';
import { useAppSelector } from '@/stores';
import { useGetProfileQuery } from '@/lib/api/endpoints/authApi';
import {
  ShieldCheck,
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Loader2,
  Edit2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import AddressUpdateModal from '@/components/profile/AddressUpdateModal';

export default function ProfilePage() {
  const { user: authUser } = useAppSelector((state) => state.auth);
  const { data: userProfile, isLoading } = useGetProfileQuery();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const user = userProfile || authUser;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold md:text-3xl">Profile</h1>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="text-brand h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="bg-card border-border rounded-xl border p-6 shadow-sm">
          <div className="border-border mb-6 flex items-center gap-4 border-b pb-6">
            <div className="bg-primary/10 text-primary flex h-20 w-20 shrink-0 items-center justify-center rounded-full">
              <UserIcon className="h-10 w-10" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold uppercase">
                {user?.firstName
                  ? `${user.firstName} ${user.lastName || ''}`
                  : user?.email?.split('@')[0] || 'Customer'}
              </h2>
              <p className="text-muted-foreground">{user?.email}</p>
              {user?.role && (
                <span className="bg-secondary text-secondary-foreground mt-2 inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold uppercase">
                  Role: {user.role}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Thông tin liên hệ */}
            <div className="flex flex-col gap-5">
              <h3 className="flex items-center gap-2 text-lg font-bold">
                <Mail className="text-brand h-5 w-5" /> Contact
              </h3>

              <div className="flex flex-col gap-2">
                <label className="text-muted-foreground text-sm font-medium">Email</label>
                <div className="bg-muted flex items-center gap-3 rounded-lg p-3">
                  <Mail className="text-muted-foreground h-5 w-5" />
                  <span>{user?.email || 'Not updated'}</span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-muted-foreground text-sm font-medium">Phone Number</label>
                <div className="bg-muted flex items-center gap-3 rounded-lg p-3">
                  <Phone className="text-muted-foreground h-5 w-5" />
                  <span>{user?.phoneNumber || 'Not updated'}</span>
                </div>
              </div>
            </div>

            {/* Địa chỉ & Bảo mật */}
            <div className="flex flex-col gap-5">
              <h3 className="flex items-center gap-2 text-lg font-bold">
                <ShieldCheck className="text-brand h-5 w-5" /> Security & Other
              </h3>

              <div className="flex flex-col gap-2">
                <label className="text-muted-foreground text-sm font-medium">Account Status</label>
                <div
                  className={`flex items-center gap-3 rounded-lg p-3 font-medium ${user?.emailConfirmed ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}
                >
                  <ShieldCheck className="h-5 w-5" />
                  <span>{user?.emailConfirmed ? 'Verified' : 'Pending'}</span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-muted-foreground text-sm font-medium">Joined Date</label>
                <div className="bg-muted flex items-center gap-3 rounded-lg p-3">
                  <Calendar className="text-muted-foreground h-5 w-5" />
                  <span>
                    {user?.createdAt
                      ? new Date(user.createdAt).toLocaleDateString('en-US')
                      : 'Unknown'}
                  </span>
                </div>
              </div>
            </div>

            {/* Thông tin Address Card Spans full width */}
            <div className="mt-2 flex flex-col gap-2 md:col-span-2">
              <div className="flex items-center justify-between">
                <label className="text-muted-foreground text-sm font-medium">
                  Default Shipping Address
                </label>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-brand hover:text-brand/80 h-8 w-fit px-2 font-semibold"
                  onClick={() => setIsModalOpen(true)}
                >
                  <Edit2 className="mr-2 h-4 w-4" />
                  Update
                </Button>
              </div>
              <div className="bg-muted flex flex-col gap-3 rounded-lg p-4 sm:flex-row sm:items-center">
                <MapPin className="text-brand h-6 w-6 shrink-0" />
                {user?.provinceName ? (
                  <div className="flex flex-col">
                    <span className="font-semibold">
                      {user.streetAddress || 'No detailed address yet'}
                    </span>
                    <span className="text-muted-foreground text-sm">
                      {user.wardName}, {user.districtName}, {user.provinceName}
                    </span>
                  </div>
                ) : (
                  <span className="text-muted-foreground italic">
                    You have not updated your shipping address yet.
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <AddressUpdateModal open={isModalOpen} onOpenChange={setIsModalOpen} user={user} />
    </div>
  );
}
