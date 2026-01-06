"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit, Plus, Trash2 } from "lucide-react";

// Mock portfolio data
const initialPortfolioItems = [
  {
    id: 1,
    image: "/placeholder.svg?height=400&width=400&text=Sustainable+Denim",
    title: "Sustainable Denim Collection",
    category: "Apparel",
    materials: "Organic Cotton, Recycled Polyester",
    description:
      "A collection of eco-friendly denim products manufactured using water-saving techniques and sustainable materials.",
    testimonial:
      "EcoFabrics delivered exceptional quality and met all our sustainability requirements. - GreenJeans Co.",
  },
  {
    id: 2,
    image: "/placeholder.svg?height=400&width=400&text=Bamboo+Activewear",
    title: "Bamboo Activewear Line",
    category: "Sportswear",
    materials: "Bamboo Fiber, Organic Cotton",
    description: "Performance activewear made from breathable bamboo fibers with moisture-wicking properties.",
    testimonial: "The quality and comfort of these pieces exceeded our expectations. - FitLife Apparel",
  },
  {
    id: 3,
    image: "/placeholder.svg?height=400&width=400&text=Hemp+Accessories",
    title: "Hemp Accessories Collection",
    category: "Accessories",
    materials: "Hemp, Organic Cotton",
    description: "Durable and sustainable accessories including bags, hats, and small goods made from hemp.",
    testimonial: null,
  },
  {
    id: 4,
    image: "/placeholder.svg?height=400&width=400&text=Recycled+Outerwear",
    title: "Recycled Polyester Outerwear",
    category: "Outerwear",
    materials: "Recycled Polyester, Recycled Nylon",
    description: "Weather-resistant jackets and coats made from post-consumer plastic bottles.",
    testimonial: "High-quality construction with impressive environmental credentials. - OutdoorLife",
  },
];

// Categories for the dropdown
const categories = [
  "Apparel",
  "Accessories",
  "Sportswear",
  "Outerwear",
  "Footwear",
  "Home Textiles",
  "Knitwear",
  "Denim",
  "Childrenswear",
  "Other",
];

export default function PortfolioPage() {
  const [portfolioItems, setPortfolioItems] = useState(initialPortfolioItems);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<any>(null);
  const [newItem, setNewItem] = useState({
    id: 0,
    image: "/placeholder.svg?height=400&width=400&text=New+Project",
    title: "",
    category: "",
    materials: "",
    description: "",
    testimonial: "",
  });

  const handleAddItem = () => {
    const itemToAdd = {
      ...newItem,
      id: portfolioItems.length + 1,
    };
    setPortfolioItems([...portfolioItems, itemToAdd]);
    setNewItem({
      id: 0,
      image: "/placeholder.svg?height=400&width=400&text=New+Project",
      title: "",
      category: "",
      materials: "",
      description: "",
      testimonial: "",
    });
    setIsAddDialogOpen(false);
  };

  const handleEditItem = () => {
    if (!currentItem) return;

    const updatedItems = portfolioItems.map((item) => (item.id === currentItem.id ? currentItem : item));
    setPortfolioItems(updatedItems);
    setIsEditDialogOpen(false);
  };

  const handleDeleteItem = (id: number) => {
    const updatedItems = portfolioItems.filter((item) => item.id !== id);
    setPortfolioItems(updatedItems);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Portfolio & Past Work</h2>
          <p className="text-[#1C1917]">Showcase your manufacturing capabilities and previous projects</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add New Project
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Add New Portfolio Project</DialogTitle>
              <DialogDescription>
                Showcase your manufacturing capabilities with a new portfolio entry.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Project Title</Label>
                <Input
                  id="title"
                  value={newItem.title}
                  onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                  placeholder="e.g. Sustainable Denim Collection"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  onValueChange={(value) => setNewItem({ ...newItem, category: value })}
                  defaultValue={newItem.category}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="materials">Materials Used</Label>
                <Input
                  id="materials"
                  value={newItem.materials}
                  onChange={(e) => setNewItem({ ...newItem, materials: e.target.value })}
                  placeholder="e.g. Organic Cotton, Recycled Polyester"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  placeholder="Describe the project, manufacturing process, and key features"
                  rows={3}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="testimonial">Client Testimonial (Optional)</Label>
                <Textarea
                  id="testimonial"
                  value={newItem.testimonial}
                  onChange={(e) => setNewItem({ ...newItem, testimonial: e.target.value })}
                  placeholder="Add a client quote or feedback"
                  rows={2}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddItem}>Add Project</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {portfolioItems.map((item) => (
          <Card key={item.id} className="overflow-hidden">
            <div className="aspect-video w-full overflow-hidden">
              <img
                src={item.image || "/placeholder.svg"}
                alt={item.title}
                className="h-full w-full object-cover transition-transform hover:scale-105"
              />
            </div>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{item.title}</CardTitle>
                  <CardDescription>{item.category}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setCurrentItem(item);
                      setIsEditDialogOpen(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteItem(item.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <span className="text-sm font-medium">Materials:</span>
                <span className="ml-1 text-sm text-[#1C1917]">{item.materials}</span>
              </div>
              <p className="text-sm">{item.description}</p>
              {item.testimonial && <div className="rounded-md bg-muted p-3 text-sm italic">"{item.testimonial}"</div>}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Edit Portfolio Project</DialogTitle>
            <DialogDescription>Update the details of your portfolio project.</DialogDescription>
          </DialogHeader>
          {currentItem && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-title">Project Title</Label>
                <Input
                  id="edit-title"
                  value={currentItem.title}
                  onChange={(e) => setCurrentItem({ ...currentItem, title: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-category">Category</Label>
                <Select
                  onValueChange={(value) => setCurrentItem({ ...currentItem, category: value })}
                  defaultValue={currentItem.category}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-materials">Materials Used</Label>
                <Input
                  id="edit-materials"
                  value={currentItem.materials}
                  onChange={(e) => setCurrentItem({ ...currentItem, materials: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={currentItem.description}
                  onChange={(e) => setCurrentItem({ ...currentItem, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-testimonial">Client Testimonial (Optional)</Label>
                <Textarea
                  id="edit-testimonial"
                  value={currentItem.testimonial || ""}
                  onChange={(e) => setCurrentItem({ ...currentItem, testimonial: e.target.value })}
                  rows={2}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditItem}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
