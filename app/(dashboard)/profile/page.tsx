import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { PiUser, PiEnvelope, PiIdentificationCard } from "react-icons/pi";
import { LogoutButton } from "@/components/auth/LogoutButton";

export default async function ProfilePage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    const user = session.user;
    const initials =
        user.name
            ?.split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase() || "??";

    return (
        <div className="container mx-auto p-6 max-w-2xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">My Profile</h1>
                <p className="text-muted-foreground mt-2">
                    Manage your account settings and preferences
                </p>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <Avatar className="h-20 w-20">
                            <AvatarImage src={user.image || ""} alt={user.name || ""} />
                            <AvatarFallback className="text-xl">{initials}</AvatarFallback>
                        </Avatar>
                        <div>
                            <CardTitle className="text-2xl">{user.name}</CardTitle>
                            <CardDescription className="text-base">
                                {user.email}
                            </CardDescription>
                            <div className="mt-2">
                                <Badge variant="secondary">User</Badge>
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6 mt-4">
                    <div className="grid gap-4">
                        <div className="flex items-center gap-4 p-4 rounded-lg border bg-card">
                            <div className="p-2 rounded-full bg-primary/10 text-primary">
                                <PiIdentificationCard className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    User ID
                                </p>
                                <p className="font-medium font-mono text-sm">{user.id}</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
                <div className="p-6 pt-0">
                    <LogoutButton />
                </div>
            </Card>
        </div>
    );
}
