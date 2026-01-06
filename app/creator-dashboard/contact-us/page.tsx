"use client";
import { useState } from "react";
import type React from "react";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { User, Mail, Phone, MessageSquare } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function ContactForm() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [formData, setFormData] = useState({
    creatorName: "",
    email: "",
    number: "",
    message: "",
  });
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await sendRfqContactEmail({
      ...formData,
    });
    // alert(res.success ? "Email sent!" : res.message);
    if (res.success) {
      toast({
        title: "Message sent successfully!",
        description: "Thanks for contacting us. Our team will get back to you shortly.",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Something went wrong!",
        description: "Unable to send your message. Please try again later.",
      });
    }
  };

  return (
    <section className="max-w-xl mx-auto p-6 bg-[hsl(45deg 15.38% 94.9%)] shadow-md border rounded-2xl">
      <h1 className="text-2xl font-semibold mb-6 text-center">Get In Touch</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <div className="flex items-center gap-2 ml-1 mb-1">
            <User className="h-4 w-4 text-black" />
            <Label htmlFor="name">Name</Label>
          </div>
          <Input
            id="creatorName"
            name="creatorName"
            type="text"
            placeholder="Enter your name"
            value={formData.creatorName}
            onChange={handleChange}
            required
          />
        </div>

        {/* Email */}
        <div>
          <div className="flex items-center gap-2 ml-1 mb-1">
            <Mail className="h-4 w-4 text-black" />
            <Label htmlFor="email">Email</Label>
          </div>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        {/* Phone */}
        <div>
          <div className="flex items-center gap-2 ml-1 mb-1">
            <Phone className="h-4 w-4 text-black" />
            <Label htmlFor="phone">Phone No.</Label>
          </div>
          <Input
            id="number"
            name="number"
            type="tel"
            placeholder="Enter your phone number"
            value={formData.number}
            onChange={handleChange}
            required
          />
        </div>

        {/* Message */}
        <div>
          <div className="flex items-center gap-2 ml-1 mb-1">
            <MessageSquare className="h-4 w-4 text-black" />
            <Label htmlFor="message">Message</Label>
          </div>
          <Textarea
            id="message"
            name="message"
            placeholder="Enter your message"
            value={formData.message}
            onChange={handleChange}
            required
          />
        </div>

        <Button type="submit" className="w-full">
          Send Message
        </Button>
      </form>
    </section>
  );
}
