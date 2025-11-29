"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PiFileText, PiEnvelope, PiPhone, PiLink } from "react-icons/pi";
import { toast } from "sonner";

interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  resumeUrl: string;
  coverLetter?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  status: "PENDING" | "REVIEWING" | "SHORTLISTED" | "REJECTED" | "HIRED";
  createdAt: Date;
}

interface ApplicationsClientProps {
  companyId: string;
  companySlug: string;
  initialApplications: Application[];
  userRole: string;
}

export function ApplicationsClient({
  companyId,
  companySlug,
  initialApplications,
  userRole,
}: ApplicationsClientProps) {
  const router = useRouter();
  const [applications, setApplications] = useState(initialApplications);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  const canEdit = userRole === "ADMIN" || userRole === "EDITOR";

  const handleStatusChange = async (
    applicationId: string,
    newStatus: string
  ) => {
    setUpdatingStatus(applicationId);
    try {
      const response = await fetch(
        `/api/companies/${companyId}/applications/${applicationId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update status");
      }

      toast.success("Application status updated");
      setApplications(
        applications.map((app) =>
          app.id === applicationId ? { ...app, status: newStatus as any } : app
        )
      );
      router.refresh();
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update status"
      );
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "HIRED":
        return "default";
      case "SHORTLISTED":
        return "default";
      case "REVIEWING":
        return "secondary";
      case "REJECTED":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Applications</h1>
        <p className="text-muted-foreground">
          Review and manage job applications
        </p>
      </div>

      {applications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">
              No applications received yet
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {applications.map((app) => (
            <Card key={app.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle>
                        {app.firstName} {app.lastName}
                      </CardTitle>
                      <Badge variant={getStatusColor(app.status)}>
                        {app.status}
                      </Badge>
                    </div>
                    <CardDescription className="space-y-1">
                      <div className="flex items-center gap-2">
                        <PiFileText className="h-4 w-4" />
                        <span className="font-medium">{app.jobTitle}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <PiEnvelope className="h-4 w-4" />
                        <span>{app.email}</span>
                      </div>
                      {app.phone && (
                        <div className="flex items-center gap-2">
                          <PiPhone className="h-4 w-4" />
                          <span>{app.phone}</span>
                        </div>
                      )}
                    </CardDescription>
                  </div>
                  {canEdit && (
                    <Select
                      value={app.status}
                      onValueChange={(value) =>
                        handleStatusChange(app.id, value)
                      }
                      disabled={updatingStatus === app.id}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="REVIEWING">Reviewing</SelectItem>
                        <SelectItem value="SHORTLISTED">Shortlisted</SelectItem>
                        <SelectItem value="REJECTED">Rejected</SelectItem>
                        <SelectItem value="HIRED">Hired</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {app.coverLetter && (
                  <div>
                    <p className="text-sm font-medium mb-1">Cover Letter</p>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {app.coverLetter}
                    </p>
                  </div>
                )}
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={app.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <PiFileText className="mr-1 h-4 w-4" />
                      View Resume
                    </a>
                  </Button>
                  {app.linkedinUrl && (
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={app.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <PiLink className="mr-1 h-4 w-4" />
                        LinkedIn
                      </a>
                    </Button>
                  )}
                  {app.portfolioUrl && (
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={app.portfolioUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <PiLink className="mr-1 h-4 w-4" />
                        Portfolio
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
