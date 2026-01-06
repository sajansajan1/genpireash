"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Download,
  FileSpreadsheet,
  Lightbulb,
  Edit,
  Upload,
  ImageIcon,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCreateOrderStore } from "@/lib/zustand/createOrder";
import { useGetTechPackStore } from "@/lib/zustand/techpacks/getTechPack";
import { useGetOrderDetailStore } from "@/lib/zustand/getOrderDetail";
import generateTechnicalSpecSheets from "@/app/actions/Sketech-generation";

interface TechPack {
  id: string;
  tech_pack: {
    productName: string;
    productOverview: string;
  };
  user_id: string;
}

interface OrderManagementProps {
  techPack: TechPack;
}

interface OrderItemSketch {
  id: string;
  url: string;
  name: string;
  type: "uploaded" | "ai-generated";
}

interface OrderItem {
  id: string;
  size: string;
  color: string;
  quantity: number;
  unitPrice: number;
  notes?: string;
  sketches: OrderItemSketch[];
}

export default function OrderManagement({ id }: any) {
  const router = useRouter();

  // Order Details
  const [orderDetails, setOrderDetails] = useState({
    orderNumber: "",
    customerName: "",
    deliveryDate: "",
    minimumOrderQuantity: 0,
    paymentTerms: "",
    specialInstructions: "",
  });

  // Mock Order Items with sketches
  const [orderItems, setOrderItems] = useState<OrderItem[]>([
    {
      id: "1",
      size: "M",
      color: "Navy Blue",
      quantity: 100,
      unitPrice: 25.5,
      notes: "Standard fit",
      sketches: [
        {
          id: "sketch1",
          url: "/placeholder.svg?height=120&width=120&text=Navy+Blue+M+Front",
          name: "Front View",
          type: "ai-generated",
        },
        {
          id: "sketch2",
          url: "/placeholder.svg?height=120&width=120&text=Navy+Blue+M+Back",
          name: "Back View",
          type: "ai-generated",
        },
      ],
    },
    {
      id: "2",
      size: "L",
      color: "Navy Blue",
      quantity: 150,
      unitPrice: 25.5,
      notes: "Standard fit",
      sketches: [
        {
          id: "sketch3",
          url: "/placeholder.svg?height=120&width=120&text=Navy+Blue+L+Front",
          name: "Front View",
          type: "ai-generated",
        },
        {
          id: "sketch4",
          url: "/placeholder.svg?height=120&width=120&text=Navy+Blue+L+Side",
          name: "Side View",
          type: "uploaded",
        },
        {
          id: "sketch5",
          url: "/placeholder.svg?height=120&width=120&text=Navy+Blue+L+Detail",
          name: "Detail View",
          type: "ai-generated",
        },
      ],
    },
    {
      id: "3",
      size: "XL",
      color: "Black",
      quantity: 75,
      unitPrice: 26.0,
      notes: "Premium material",
      sketches: [
        {
          id: "sketch6",
          url: "/placeholder.svg?height=120&width=120&text=Black+XL+Front",
          name: "Front View",
          type: "ai-generated",
        },
      ],
    },
  ]);

  // New Item Form
  const [newItem, setNewItem] = useState({
    size: "",
    color: "",
    quantity: 0,
    unitPrice: 0,
    notes: "",
  });

  const [selectedItemForSketches, setSelectedItemForSketches] = useState<string | null>(null);
  const [isSketchDialogOpen, setIsSketchDialogOpen] = useState(false);
  const { setCreateOrder, loadingCreateOrder, errorCreateOrder } = useCreateOrderStore();
  const { fetchGetTechPack, getTechPack, loadingGetTechPack, errorGetTechPack, refreshGetTechPack } =
    useGetTechPackStore();
  const { fetchGetOrderDetail, getOrderDetail, loadingGetOrderDetail, errorGetOrderDetail, refreshGetOrderDetail } =
    useGetOrderDetailStore();
  useEffect(() => {
    if (id) {
      refreshGetTechPack(id);
      fetchGetTechPack({ id });
    }
  }, [id, fetchGetTechPack]);
  useEffect(() => {
    if (id) {
      refreshGetOrderDetail();
      fetchGetOrderDetail(id);
    }
  }, [id, fetchGetTechPack]);
  useEffect(() => {
    if (!id) return;

    if (getOrderDetail && !orderDetails.orderNumber) {
      // If valid data
      setOrderDetails({
        orderNumber: getOrderDetail.order_number || "",
        customerName: getOrderDetail.customer_name || "",
        deliveryDate: getOrderDetail.delivery_date || "",
        minimumOrderQuantity: getOrderDetail.minimum_order_quantity || 0,
        paymentTerms: getOrderDetail.payment_terms || "",
        specialInstructions: getOrderDetail.special_instructions || "",
      });

      // You could also optionally reset orderItems if part of getOrderDetail
    }

    if (getOrderDetail === null) {
      // No order data found
      setOrderDetails({
        orderNumber: "",
        customerName: "",
        deliveryDate: "",
        minimumOrderQuantity: 0,
        paymentTerms: "",
        specialInstructions: "",
      });

      setOrderItems([]); // Reset mock or existing items
    }
  }, [getOrderDetail, id]);

  if (loadingGetTechPack || !getTechPack || errorGetTechPack) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const sizes = ["XS", "S", "M", "L", "XL", "XXL"];
  const colors = ["Navy Blue", "Black", "White", "Gray", "Red", "Green", "Purple"];

  // Calculations
  const totalQuantity = orderItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalValue = orderItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const averageUnitPrice = totalQuantity > 0 ? totalValue / totalQuantity : 0;

  const addItem = () => {
    if (newItem.size && newItem.color && newItem.quantity > 0 && newItem.unitPrice > 0) {
      const item: OrderItem = {
        id: Date.now().toString(),
        ...newItem,
        sketches: [],
      };
      setOrderItems([...orderItems, item]);
      setNewItem({ size: "", color: "", quantity: 0, unitPrice: 0, notes: "" });
    }
  };

  const removeItem = (id: string) => {
    setOrderItems(orderItems.filter((item) => item.id !== id));
  };

  const updateItem = (id: string, field: keyof OrderItem, value: any) => {
    setOrderItems(orderItems.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const addSketchToItem = (itemId: string, sketch: OrderItemSketch) => {
    setOrderItems(
      orderItems.map((item) => (item.id === itemId ? { ...item, sketches: [...item.sketches, sketch] } : item))
    );
  };

  const removeSketchFromItem = (itemId: string, sketchId: string) => {
    setOrderItems(
      orderItems.map((item) =>
        item.id === itemId ? { ...item, sketches: item.sketches.filter((sketch) => sketch.id !== sketchId) } : item
      )
    );
  };

  const generateAISketch = async (itemId: string, viewType: string) => {
    console.log("jskkjjkjkjkkkjkjk");
    const item = orderItems.find((i) => i.id === itemId);
    if (!item) return;
    // const result = await generateTechnicalSpecSheets(
    //   "https://kmjcfvapjbiqskkuyibt.supabase.co/storage/v1/object/fileuploads/front_2025-08-05T03:55:24.906Z.png",
    //   {
    //     company_name: "Salt Riot",
    //     product_name: "Microfiber Athletic Shorts",
    //     style_number: "SR-2024-001",
    //     designer: "Design Team",
    //     season: "Spring 2024",
    //   },
    //   {
    //     includeViews: ["technical_spec"], // Just the complete spec sheet
    //   }
    // );
    // console.log(result, "result");
    const newSketch: OrderItemSketch = {
      id: `ai-sketch-${Date.now()}`,
      url: `/placeholder.svg?height=120&width=120&text=${item.color}+${item.size}+${viewType}`,
      name: `${viewType} View (AI Generated)`,
      type: "ai-generated",
    };

    addSketchToItem(itemId, newSketch);
  };

  const handleSaveOrder = async () => {
    const data = await setCreateOrder({
      tech_pack_id: id,
      order_number: orderDetails.orderNumber,
      customer_name: orderDetails.customerName,
      delivery_date: orderDetails.deliveryDate,
      payment_terms: orderDetails.paymentTerms,
      minimum_order_quantity: orderDetails.minimumOrderQuantity,
      special_instructions: orderDetails.specialInstructions,
    });
    console.log("Order created:", data);
    if (errorCreateOrder) {
      alert("Failed to create order: " + errorCreateOrder);
    } else {
      alert("Order created successfully!");
    }
  };

  const exportToCSV = () => {
    const headers = ["Size", "Color", "Quantity", "Unit Price", "Total", "Notes", "Sketches Count"];
    const csvContent = [
      headers.join(","),
      ...orderItems.map((item) =>
        [
          item.size,
          item.color,
          item.quantity,
          item.unitPrice,
          (item.quantity * item.unitPrice).toFixed(2),
          item.notes || "",
          item.sketches.length,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `order-${orderDetails.orderNumber}.csv`;
    a.click();
  };

  const openSketchDialog = (itemId: string) => {
    setSelectedItemForSketches(itemId);
    setIsSketchDialogOpen(true);
  };

  const selectedItem = selectedItemForSketches ? orderItems.find((item) => item.id === selectedItemForSketches) : null;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" onClick={() => router.push("/creator-dashboard/techpacks")} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tech Packs
          </Button>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Management</h1>
              <p className="text-gray-600">{getTechPack.tech_pack.productName}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={exportToCSV}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Button variant="outline">
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Export Excel
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Order Details & Items */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Details */}
            <Card>
              <CardHeader>
                <CardTitle>Order Details</CardTitle>
                <CardDescription>Basic information about this order</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="orderNumber">Order Number</Label>
                    <Input
                      id="orderNumber"
                      value={orderDetails.orderNumber}
                      onChange={(e) => setOrderDetails({ ...orderDetails, orderNumber: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="customerName">Customer Name</Label>
                    <Input
                      id="customerName"
                      value={orderDetails.customerName}
                      onChange={(e) => setOrderDetails({ ...orderDetails, customerName: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="deliveryDate">Delivery Date</Label>
                    <Input
                      id="deliveryDate"
                      type="date"
                      value={orderDetails.deliveryDate}
                      onChange={(e) => setOrderDetails({ ...orderDetails, deliveryDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="minimumOrderQuantity">Minimum Order Quantity</Label>
                    <Input
                      id="minimumOrderQuantity"
                      type="number"
                      value={orderDetails.minimumOrderQuantity}
                      onChange={(e) =>
                        setOrderDetails({ ...orderDetails, minimumOrderQuantity: Number.parseInt(e.target.value) || 0 })
                      }
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="paymentTerms">Payment Terms</Label>
                  <Input
                    id="paymentTerms"
                    value={orderDetails.paymentTerms}
                    onChange={(e) => setOrderDetails({ ...orderDetails, paymentTerms: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="specialInstructions">Special Instructions</Label>
                  <Textarea
                    id="specialInstructions"
                    value={orderDetails.specialInstructions}
                    onChange={(e) => setOrderDetails({ ...orderDetails, specialInstructions: e.target.value })}
                    rows={3}
                  />
                </div>
                <Separator />
                <div className="flex justify-between items-center font-semibold text-lg">
                  <span>Save Details:</span>
                  <Button onClick={handleSaveOrder}>
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
                <CardDescription>Manage the items in this order with visual sketches</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sketches</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Color</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Unit Price</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orderItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="flex -space-x-2">
                              {item.sketches.slice(0, 3).map((sketch, index) => (
                                <div
                                  key={sketch.id}
                                  className="relative w-8 h-8 rounded border-2 border-white bg-gray-100 overflow-hidden"
                                  style={{ zIndex: 3 - index }}
                                >
                                  <img
                                    src={sketch.url || "/placeholder.svg"}
                                    alt={sketch.name}
                                    className="w-full h-full object-cover"
                                  />
                                  {sketch.type === "ai-generated" && (
                                    <div className="absolute top-0 right-0 w-2 h-2 bg-purple-500 rounded-full"></div>
                                  )}
                                </div>
                              ))}
                              {item.sketches.length > 3 && (
                                <div className="w-8 h-8 rounded border-2 border-white bg-gray-200 flex items-center justify-center text-xs font-medium">
                                  +{item.sketches.length - 3}
                                </div>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openSketchDialog(item.id)}
                              className="h-8 px-2"
                            >
                              <ImageIcon className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Select value={item.size} onValueChange={(value) => updateItem(item.id, "size", value)}>
                            <SelectTrigger className="w-20">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {sizes.map((size) => (
                                <SelectItem key={size} value={size}>
                                  {size}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Select value={item.color} onValueChange={(value) => updateItem(item.id, "color", value)}>
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {colors.map((color) => (
                                <SelectItem key={color} value={color}>
                                  {color}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateItem(item.id, "quantity", Number.parseInt(e.target.value) || 0)}
                            className="w-20"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.01"
                            value={item.unitPrice}
                            onChange={(e) => updateItem(item.id, "unitPrice", Number.parseFloat(e.target.value) || 0)}
                            className="w-24"
                          />
                        </TableCell>
                        <TableCell className="font-semibold">${(item.quantity * item.unitPrice).toFixed(2)}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Add New Item Form */}
                <div className="mt-6 p-4 border rounded-lg bg-gray-50">
                  <h4 className="font-semibold mb-4">Add New Item</h4>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div>
                      <Label>Size</Label>
                      <Select value={newItem.size} onValueChange={(value) => setNewItem({ ...newItem, size: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Size" />
                        </SelectTrigger>
                        <SelectContent>
                          {sizes.map((size) => (
                            <SelectItem key={size} value={size}>
                              {size}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Color</Label>
                      <Select value={newItem.color} onValueChange={(value) => setNewItem({ ...newItem, color: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Color" />
                        </SelectTrigger>
                        <SelectContent>
                          {colors.map((color) => (
                            <SelectItem key={color} value={color}>
                              {color}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Quantity</Label>
                      <Input
                        type="number"
                        value={newItem.quantity || ""}
                        onChange={(e) => setNewItem({ ...newItem, quantity: Number.parseInt(e.target.value) || 0 })}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label>Unit Price</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={newItem.unitPrice || ""}
                        onChange={(e) => setNewItem({ ...newItem, unitPrice: Number.parseFloat(e.target.value) || 0 })}
                        placeholder="0.00"
                      />
                    </div>
                    <div className="flex items-end">
                      <Button onClick={addItem} className="w-full">
                        <Plus className="h-4 w-4 mr-2" />
                        Add
                      </Button>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Label>Notes (Optional)</Label>
                    <Input
                      value={newItem.notes}
                      onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
                      placeholder="Additional specifications..."
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Summary & Actions */}
          <div className="space-y-6">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total Items:</span>
                    <span className="font-semibold">{orderItems.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Quantity:</span>
                    <span className="font-semibold">{totalQuantity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Sketches:</span>
                    <span className="font-semibold">
                      {orderItems.reduce((sum, item) => sum + item.sketches.length, 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Average Unit Price:</span>
                    <span className="font-semibold">${averageUnitPrice.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg">
                    <span className="font-semibold">Total Value:</span>
                    <span className="font-bold text-green-600">${totalValue.toFixed(2)}</span>
                  </div>
                </div>

                <div className="pt-4 space-y-2">
                  <Button className="w-full">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit with AI
                  </Button>
                  <Button variant="outline" className="w-full bg-transparent">
                    Save as Template
                  </Button>
                  <Button variant="outline" className="w-full bg-transparent">
                    Send to Supplier
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* AI Suggestions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lightbulb className="h-5 w-5 mr-2 text-yellow-500" />
                  AI Suggestions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Volume Discount:</strong> Order 50+ more units to get 5% discount
                  </p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-800">
                    <strong>Size Mix:</strong> Consider 30% M, 40% L, 30% XL distribution
                  </p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <p className="text-sm text-purple-800">
                    <strong>Missing Sketches:</strong> Generate AI sketches for better visualization
                  </p>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg">
                  <p className="text-sm text-orange-800">
                    <strong>Lead Time:</strong> Current order: 3-4 weeks production time
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Most Popular Size:</span>
                  <Badge>L (150 units)</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Most Popular Color:</span>
                  <Badge>Navy Blue (250 units)</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Order Status:</span>
                  <Badge variant="secondary">Draft</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">AI Generated:</span>
                  <Badge variant="outline" className="text-purple-600 border-purple-200">
                    {orderItems.reduce(
                      (sum, item) => sum + item.sketches.filter((s) => s.type === "ai-generated").length,
                      0
                    )}{" "}
                    sketches
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Sketch Management Dialog */}
        <Dialog open={isSketchDialogOpen} onOpenChange={setIsSketchDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Manage Sketches - {selectedItem?.color} {selectedItem?.size}
              </DialogTitle>
              <DialogDescription>Upload your own sketches or generate AI mockups for this order item</DialogDescription>
            </DialogHeader>

            {selectedItem && (
              <div className="space-y-6">
                {/* AI Generation Section */}
                <div className="border rounded-lg p-4 bg-gradient-to-r from-purple-50 to-blue-50">
                  <h4 className="font-semibold mb-3 flex items-center">
                    <Sparkles className="h-5 w-5 mr-2 text-purple-600" />
                    AI Sketch Generation
                  </h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Generate professional mockups for {selectedItem.color} {selectedItem.size} variant
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => generateAISketch(selectedItem.id, "Front")}
                      className="bg-white"
                    >
                      <Sparkles className="h-4 w-4 mr-1" />
                      Front View
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => generateAISketch(selectedItem.id, "Back")}
                      className="bg-white"
                    >
                      <Sparkles className="h-4 w-4 mr-1" />
                      Back View
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => generateAISketch(selectedItem.id, "Side")}
                      className="bg-white"
                    >
                      <Sparkles className="h-4 w-4 mr-1" />
                      Side View
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => generateAISketch(selectedItem.id, "Detail")}
                      className="bg-white"
                    >
                      <Sparkles className="h-4 w-4 mr-1" />
                      Detail View
                    </Button>
                  </div>
                </div>

                {/* Upload Section */}
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-3 flex items-center">
                    <Upload className="h-5 w-5 mr-2" />
                    Upload Custom Sketches
                  </h4>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600 mb-2">Drag and drop your sketches here, or click to browse</p>
                    <Button variant="outline" size="sm">
                      Choose Files
                    </Button>
                    <p className="text-xs text-gray-500 mt-2">Supports JPG, PNG, SVG up to 10MB each</p>
                  </div>
                </div>

                {/* Current Sketches */}
                <div>
                  <h4 className="font-semibold mb-3">Current Sketches ({selectedItem.sketches.length})</h4>
                  {selectedItem.sketches.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <ImageIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                      <p>No sketches yet. Generate AI mockups or upload your own.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {selectedItem.sketches.map((sketch) => (
                        <div key={sketch.id} className="relative group">
                          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border">
                            <img
                              src={sketch.url || "/placeholder.svg"}
                              alt={sketch.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              size="icon"
                              variant="destructive"
                              className="h-6 w-6"
                              onClick={() => removeSketchFromItem(selectedItem.id, sketch.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                          <div className="absolute bottom-2 left-2 right-2">
                            <div className="bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center justify-between">
                              <span className="truncate">{sketch.name}</span>
                              {sketch.type === "ai-generated" && <Sparkles className="h-3 w-3 text-purple-300 ml-1" />}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
