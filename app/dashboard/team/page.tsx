import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Search, Mail, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Volkhov } from "next/font/google";

const volkhov = Volkhov({ weight: ["400", "700"], subsets: ["latin"] });

export default function TeamPage() {
  // Sample team members data
  const teamMembers = [
    {
      id: "1",
      name: "Alex Lee",
      email: "alex@example.com",
      role: "Admin",
      department: "Product Development",
      joinedAt: "January 15, 2025",
      avatar: "/placeholder.svg?height=40&width=40&text=AL",
      status: "active",
    },
    {
      id: "2",
      name: "Sarah Johnson",
      email: "sarah@example.com",
      role: "Designer",
      department: "Design",
      joinedAt: "February 3, 2025",
      avatar: "/placeholder.svg?height=40&width=40&text=SJ",
      status: "active",
    },
    {
      id: "3",
      name: "Michael Chen",
      email: "michael@example.com",
      role: "Product Manager",
      department: "Product Development",
      joinedAt: "February 10, 2025",
      avatar: "/placeholder.svg?height=40&width=40&text=MC",
      status: "active",
    },
    {
      id: "4",
      name: "Priya Patel",
      email: "priya@example.com",
      role: "Supplier Manager",
      department: "Operations",
      joinedAt: "March 5, 2025",
      avatar: "/placeholder.svg?height=40&width=40&text=PP",
      status: "active",
    },
    {
      id: "5",
      name: "David Wilson",
      email: "david@example.com",
      role: "Developer",
      department: "Engineering",
      joinedAt: "March 15, 2025",
      avatar: "/placeholder.svg?height=40&width=40&text=DW",
      status: "pending",
    },
    {
      id: "6",
      name: "Emma Rodriguez",
      email: "emma@example.com",
      role: "Marketing Specialist",
      department: "Marketing",
      joinedAt: "March 20, 2025",
      avatar: "/placeholder.svg?height=40&width=40&text=ER",
      status: "pending",
    },
  ];

  // Sample pending invitations
  const pendingInvitations = [
    {
      id: "1",
      email: "james@example.com",
      role: "Designer",
      department: "Design",
      invitedAt: "March 25, 2025",
      status: "pending",
    },
    {
      id: "2",
      email: "olivia@example.com",
      role: "Product Manager",
      department: "Product Development",
      invitedAt: "March 26, 2025",
      status: "pending",
    },
  ];

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className={`text-3xl font-bold tracking-tight ${volkhov.className}`}>Team Management</h1>
          <p className="text-[#1C1917] mt-1">Manage your team members and their access to Genpire.</p>
        </div>
        <Button className="mt-4 md:mt-0" size="lg">
          <PlusCircle className="mr-2 h-5 w-5" /> Invite Team Member
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[#1C1917]" />
          <Input type="search" placeholder="Search team members..." className="w-full pl-8" />
        </div>
        <div className="flex gap-2">
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              <SelectItem value="product">Product Development</SelectItem>
              <SelectItem value="design">Design</SelectItem>
              <SelectItem value="operations">Operations</SelectItem>
              <SelectItem value="engineering">Engineering</SelectItem>
              <SelectItem value="marketing">Marketing</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="manager">Product Manager</SelectItem>
              <SelectItem value="designer">Designer</SelectItem>
              <SelectItem value="developer">Developer</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="members" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="members">Team Members</TabsTrigger>
          <TabsTrigger value="pending">Pending Invitations</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="mt-0">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {teamMembers.map((member) => (
              <Card key={member.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarImage src={member.avatar} alt={member.name} />
                        <AvatarFallback>
                          {member.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className={volkhov.className}>{member.name}</CardTitle>
                        <CardDescription className="flex items-center">
                          <Mail className="h-3.5 w-3.5 mr-1" />
                          {member.email}
                        </CardDescription>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">More options</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>Edit Member</DropdownMenuItem>
                        <DropdownMenuItem>Change Role</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">Remove Member</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="flex justify-between mb-2">
                    <div className="text-sm text-[#1C1917]">Role</div>
                    <div className="text-sm font-medium">{member.role}</div>
                  </div>
                  <div className="flex justify-between mb-2">
                    <div className="text-sm text-[#1C1917]">Department</div>
                    <div className="text-sm font-medium">{member.department}</div>
                  </div>
                  <div className="flex justify-between">
                    <div className="text-sm text-[#1C1917]">Joined</div>
                    <div className="text-sm font-medium">{member.joinedAt}</div>
                  </div>
                </CardContent>
                <CardFooter>
                  <div className="w-full flex justify-between items-center">
                    <Badge variant={member.status === "active" ? "default" : "outline"}>
                      {member.status === "active" ? "Active" : "Pending"}
                    </Badge>
                    <Button variant="outline" size="sm">
                      View Activity
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="pending" className="mt-0">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {pendingInvitations.map((invitation) => (
              <Card key={invitation.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className={volkhov.className}>{invitation.email}</CardTitle>
                      <CardDescription>Invitation pending</CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">More options</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>Resend Invitation</DropdownMenuItem>
                        <DropdownMenuItem>Edit Invitation</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">Cancel Invitation</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="flex justify-between mb-2">
                    <div className="text-sm text-[#1C1917]">Role</div>
                    <div className="text-sm font-medium">{invitation.role}</div>
                  </div>
                  <div className="flex justify-between mb-2">
                    <div className="text-sm text-[#1C1917]">Department</div>
                    <div className="text-sm font-medium">{invitation.department}</div>
                  </div>
                  <div className="flex justify-between">
                    <div className="text-sm text-[#1C1917]">Invited</div>
                    <div className="text-sm font-medium">{invitation.invitedAt}</div>
                  </div>
                </CardContent>
                <CardFooter>
                  <div className="w-full flex justify-between items-center">
                    <Badge variant="secondary">Pending</Badge>
                    <Button variant="outline" size="sm">
                      Resend
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="departments" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className={volkhov.className}>Departments</CardTitle>
              <CardDescription>Manage your organization's departments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {["Product Development", "Design", "Operations", "Engineering", "Marketing", "Sales"].map(
                    (dept, index) => (
                      <Card key={index}>
                        <CardHeader className="pb-2">
                          <CardTitle className={volkhov.className}>{dept}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-sm text-[#1C1917]">
                            {index === 0
                              ? "5 members"
                              : index === 1
                              ? "3 members"
                              : index === 2
                              ? "2 members"
                              : index === 3
                              ? "1 member"
                              : index === 4
                              ? "1 member"
                              : "0 members"}
                          </div>
                        </CardContent>
                        <CardFooter>
                          <Button variant="outline" size="sm">
                            Manage
                          </Button>
                        </CardFooter>
                      </Card>
                    )
                  )}
                </div>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Department
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className={volkhov.className}>Roles & Permissions</CardTitle>
              <CardDescription>Manage roles and their permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {["Admin", "Product Manager", "Designer", "Developer", "Viewer"].map((role, index) => (
                    <Card key={index}>
                      <CardHeader className="pb-2">
                        <CardTitle className={volkhov.className}>{role}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-sm text-[#1C1917]">
                          {index === 0
                            ? "Full access to all features"
                            : index === 1
                            ? "Can manage products and specs"
                            : index === 2
                            ? "Can create and edit designs"
                            : index === 3
                            ? "Can view and comment"
                            : "View-only access"}
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button variant="outline" size="sm">
                          Edit Permissions
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Custom Role
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
