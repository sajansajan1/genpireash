"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckCircle, XCircle, Eye, Clock, AlertCircle } from "lucide-react";
import { approveManufacturer, rejectManufacturer } from "@/app/actions/admin";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase/client";

interface ManufacturerApplication {
  id: string;
  company_name: string;
  contact_person: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  website?: string;
  years_in_business: number;
  employee_count: string;
  production_capacity: string;
  certifications: string[];
  product_categories: string[];
  minimum_order_quantity: string;
  lead_time: string;
  quality_control_process: string;
  sustainability_practices: string;
  additional_info?: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
  rejection_reason?: string;
}

export default function ManufacturersPage() {
  const [applications, setApplications] = useState<ManufacturerApplication[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<ManufacturerApplication | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from("manufacturer_applications")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching applications:", error);
        toast({
          title: "Error",
          description: "Failed to fetch manufacturer applications",
          variant: "destructive",
        });
        return;
      }

      setApplications(data || []);
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    setActionLoading(true);
    try {
      const result = await approveManufacturer(id);
      if (result.success) {
        toast({
          title: "Success",
          description: "Manufacturer application approved successfully",
        });
        fetchApplications();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to approve application",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedApplication || !rejectionReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a rejection reason",
        variant: "destructive",
      });
      return;
    }

    setActionLoading(true);
    try {
      const result = await rejectManufacturer(selectedApplication.id, rejectionReason);
      if (result.success) {
        toast({
          title: "Success",
          description: "Manufacturer application rejected",
        });
        setIsRejectDialogOpen(false);
        setRejectionReason("");
        setSelectedApplication(null);
        fetchApplications();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to reject application",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Manufacturer Applications</h1>
        <p className="text-gray-600 mt-2">Review and manage manufacturer applications</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {applications.filter((app) => app.status === "pending").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-gray-900">
                  {applications.filter((app) => app.status === "approved").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <XCircle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-gray-900">
                  {applications.filter((app) => app.status === "rejected").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertCircle className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{applications.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Applications Table */}
      <Card>
        <CardHeader>
          <CardTitle>Applications</CardTitle>
          <CardDescription>All manufacturer applications and their current status</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Contact Person</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Applied</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((application) => (
                <TableRow key={application.id}>
                  <TableCell className="font-medium">{application.company_name}</TableCell>
                  <TableCell>{application.contact_person}</TableCell>
                  <TableCell>{application.email}</TableCell>
                  <TableCell>{application.country}</TableCell>
                  <TableCell>{getStatusBadge(application.status)}</TableCell>
                  <TableCell>{new Date(application.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedApplication(application);
                          setIsViewDialogOpen(true);
                        }}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      {application.status === "pending" && (
                        <>
                          <Button size="sm" onClick={() => handleApprove(application.id)} disabled={actionLoading}>
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setSelectedApplication(application);
                              setIsRejectDialogOpen(true);
                            }}
                            disabled={actionLoading}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Application Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manufacturer Application Details</DialogTitle>
            <DialogDescription>
              Complete application information for {selectedApplication?.company_name}
            </DialogDescription>
          </DialogHeader>

          {selectedApplication && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900">Company Information</h3>
                  <div className="mt-2 space-y-2">
                    <p>
                      <span className="font-medium">Company Name:</span> {selectedApplication.company_name}
                    </p>
                    <p>
                      <span className="font-medium">Contact Person:</span> {selectedApplication.contact_person}
                    </p>
                    <p>
                      <span className="font-medium">Email:</span> {selectedApplication.email}
                    </p>
                    <p>
                      <span className="font-medium">Phone:</span> {selectedApplication.phone}
                    </p>
                    <p>
                      <span className="font-medium">Location:</span> {selectedApplication.city},{" "}
                      {selectedApplication.country}
                    </p>
                    {selectedApplication.website && (
                      <p>
                        <span className="font-medium">Website:</span> {selectedApplication.website}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900">Business Details</h3>
                  <div className="mt-2 space-y-2">
                    <p>
                      <span className="font-medium">Years in Business:</span> {selectedApplication.years_in_business}
                    </p>
                    <p>
                      <span className="font-medium">Employee Count:</span> {selectedApplication.employee_count}
                    </p>
                    <p>
                      <span className="font-medium">Production Capacity:</span>{" "}
                      {selectedApplication.production_capacity}
                    </p>
                    <p>
                      <span className="font-medium">Min Order Quantity:</span>{" "}
                      {selectedApplication.minimum_order_quantity}
                    </p>
                    <p>
                      <span className="font-medium">Lead Time:</span> {selectedApplication.lead_time}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900">Capabilities</h3>
                  <div className="mt-2 space-y-2">
                    <div>
                      <span className="font-medium">Product Categories:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedApplication.product_categories.map((category, index) => (
                          <Badge key={index} variant="secondary">
                            {category}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium">Certifications:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedApplication.certifications.map((cert, index) => (
                          <Badge key={index} variant="outline">
                            {cert}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900">Quality & Sustainability</h3>
                  <div className="mt-2 space-y-2">
                    <p>
                      <span className="font-medium">Quality Control:</span>{" "}
                      {selectedApplication.quality_control_process}
                    </p>
                    <p>
                      <span className="font-medium">Sustainability:</span>{" "}
                      {selectedApplication.sustainability_practices}
                    </p>
                  </div>
                </div>

                {selectedApplication.additional_info && (
                  <div>
                    <h3 className="font-semibold text-gray-900">Additional Information</h3>
                    <p className="mt-2">{selectedApplication.additional_info}</p>
                  </div>
                )}

                <div>
                  <h3 className="font-semibold text-gray-900">Application Status</h3>
                  <div className="mt-2">
                    {getStatusBadge(selectedApplication.status)}
                    {selectedApplication.reviewed_at && (
                      <p className="text-sm text-gray-600 mt-1">
                        Reviewed on {new Date(selectedApplication.reviewed_at).toLocaleDateString()} by{" "}
                        {selectedApplication.reviewed_by}
                      </p>
                    )}
                    {selectedApplication.rejection_reason && (
                      <p className="text-sm text-red-600 mt-1">
                        Rejection reason: {selectedApplication.rejection_reason}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Application Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Application</DialogTitle>
            <DialogDescription>Please provide a reason for rejecting this manufacturer application.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="rejection-reason">Rejection Reason</Label>
              <Textarea
                id="rejection-reason"
                placeholder="Please explain why this application is being rejected..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsRejectDialogOpen(false);
                setRejectionReason("");
                setSelectedApplication(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={actionLoading || !rejectionReason.trim()}>
              {actionLoading ? "Rejecting..." : "Reject Application"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
