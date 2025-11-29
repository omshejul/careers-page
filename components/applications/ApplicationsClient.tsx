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
    <div className="container mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Applications</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Review and manage job applications
        </p>
      </div>

      {applications.length === 0 ? (
        <Card className="py-0">
          <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12 px-4">
            <p className="text-sm sm:text-base text-muted-foreground">
              No applications received yet
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {applications.map((app) => (
            <Card className="py-0" key={app.id}>
              <CardHeader className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                      <CardTitle className="text-lg sm:text-xl break-words">
                        {app.firstName} {app.lastName}
                      </CardTitle>
                      <Badge variant={getStatusColor(app.status)} className="w-fit">
                        {app.status}
                      </Badge>
                    </div>
                    <CardDescription className="space-y-1 text-xs sm:text-sm">
                      <div className="flex items-center gap-2">
                        <PiFileText className="h-4 w-4 flex-shrink-0" />
                        <span className="font-medium break-words">{app.jobTitle}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <PiEnvelope className="h-4 w-4 flex-shrink-0" />
                        <span className="break-all">{app.email}</span>
                      </div>
                      {app.phone && (
                        <div className="flex items-center gap-2">
                          <PiPhone className="h-4 w-4 flex-shrink-0" />
                          <span className="break-all">{app.phone}</span>
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
                      <SelectTrigger className="w-full sm:w-[180px]">
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
              <CardContent className="space-y-3 p-4 sm:p-6 pt-0">
                {app.coverLetter && (
                  <div>
                    <p className="text-sm font-medium mb-1">Cover Letter</p>
                    <p className="text-sm text-muted-foreground line-clamp-3 break-words">
                      {app.coverLetter}
                    </p>
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" asChild className="flex-1 sm:flex-initial">
                    <a
                      href={app.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <PiFileText className="h-4 w-4 sm:mr-1" />
                      <span className="hidden sm:inline">View Resume</span>
                      <span className="sm:hidden">Resume</span>
                    </a>
                  </Button>
                  {app.linkedinUrl && (
                    <Button variant="outline" size="sm" asChild className="flex-1 sm:flex-initial">
                      <a
                        href={app.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <PiLink className="h-4 w-4 sm:mr-1" />
                        <span className="hidden sm:inline">LinkedIn</span>
                        <span className="sm:hidden">LinkedIn</span>
                      </a>
                    </Button>
                  )}
                  {app.portfolioUrl && (
                    <Button variant="outline" size="sm" asChild className="flex-1 sm:flex-initial">
                      <a
                        href={app.portfolioUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <PiLink className="h-4 w-4 sm:mr-1" />
                        <span className="hidden sm:inline">Portfolio</span>
                        <span className="sm:hidden">Portfolio</span>
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
