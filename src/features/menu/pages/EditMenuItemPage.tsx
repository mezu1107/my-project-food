// src/features/menu/pages/admin/EditMenuItemPage.tsx
import { useEffect, useState, ChangeEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Trash2, Globe } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod"; // ← THIS WAS MISSING
import { toast } from "sonner";

import {
  useMenuItem,
  useUpdateMenuItem,
  useAvailableAreas,
} from "@/features/menu/hooks/useMenuApi";
import { CATEGORY_OPTIONS, type MenuCategory } from "@/features/menu/types/menu.types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  price: z.coerce.number().positive("Price must be positive"),
  category: z.enum(["breakfast", "lunch", "dinner", "desserts", "beverages"]),
  isVeg: z.boolean(),
  isSpicy: z.boolean(),
  isAvailable: z.boolean(),
  availableInAreas: z.array(z.string()),
  image: z.instanceof(File).optional().nullable(),
});

type FormValues = z.infer<typeof formSchema>;


export default function EditMenuItemPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: itemData, isLoading: itemLoading } = useMenuItem(id);
  const { data: areasData, isLoading: areasLoading } = useAvailableAreas();
  const updateMutation = useUpdateMenuItem();

  const item = itemData?.item;

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      category: "lunch",
      isVeg: false,
      isSpicy: false,
      isAvailable: true,
      availableInAreas: [],
      image: null,
    },
  });

  useEffect(() => {
    if (item) {
      form.reset({
        name: item.name,
        description: item.description || "",
        price: item.price,
        category: item.category,
        isVeg: item.isVeg,
        isSpicy: item.isSpicy,
        isAvailable: item.isAvailable,
        availableInAreas: item.availableInAreas || [],
        image: null,
      });
      setPreviewUrl(null);
    }
  }, [item, form]);

  const selectedAreas = form.watch("availableInAreas");

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image");
      return;
    }

    form.setValue("image", file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const removeImage = () => {
    form.setValue("image", undefined);
    setPreviewUrl(null);
    toast.info("New image removed");
  };

  const onSubmit = (values: FormValues) => {
    if (!id) return;

    updateMutation.mutate(
      {
        id,
        data: {
          ...values,
          description: values.description || undefined,
          image: values.image || undefined,
        },
      },
      {
        onSuccess: () => {
          toast.success("Item updated successfully!");
          navigate("/admin/menu");
        },
        onError: () => {
          toast.error("Failed to update item");
        },
      }
    );
  };

  if (itemLoading || areasLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="text-center py-20">
        <p className="text-2xl text-muted-foreground">Item not found</p>
        <Button variant="outline" onClick={() => navigate("/admin/menu")} className="mt-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Menu
        </Button>
      </div>
    );
  }

  return (
    <div className="container max-w-5xl mx-auto py-10">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={() => navigate("/admin/menu")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-4xl font-bold">Edit Menu Item</h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
          <div className="grid gap-10 md:grid-cols-3">
            {/* Image Card */}
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Image</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="relative aspect-square overflow-hidden rounded-xl border-2 border-dashed border-muted-foreground/20 bg-muted/50">
                  {previewUrl || item.image ? (
                    <img
                      src={previewUrl || item.image}
                      alt="Preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                      No image
                    </div>
                  )}
                  {(previewUrl || item.image) && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-3 right-3"
                      onClick={removeImage}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div>
                  <Label htmlFor="image">Change Image</Label>
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="mt-2"
                  />
                  <p className="mt-2 text-xs text-muted-foreground">
                    Recommended: 800×800px • JPG, PNG, WebP
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Details Card */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Item Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Butter Chicken" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price (Rs.) *</FormLabel>
                        <FormControl>
                          <Input type="number" step="1" placeholder="299" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Rich, creamy tomato-based curry with tender chicken..."
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CATEGORY_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              <div className="flex items-center gap-3">
                                <span>{opt.icon}</span>
                                <span>{opt.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex flex-wrap gap-8">
                  <FormField
                    control={form.control}
                    name="isVeg"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer">Vegetarian</FormLabel>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isSpicy"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer">Spicy</FormLabel>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isAvailable"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer">Available</FormLabel>
                      </FormItem>
                    )}
                  />
                </div>

                <Separator />

                {/* Available Areas */}
                <FormField
                  control={form.control}
                  name="availableInAreas"
                  render={() => (
                    <FormItem>
                      <FormLabel>Available In Areas</FormLabel>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto rounded-lg border p-4 bg-muted/30">
                          {areasData?.areas.map((area) => (
                            <FormItem
                              key={area.id}
                              className="flex flex-row items-center space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={selectedAreas.includes(area.id)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      form.setValue("availableInAreas", [...selectedAreas, area.id]);
                                    } else {
                                      form.setValue(
                                        "availableInAreas",
                                        selectedAreas.filter((id) => id !== area.id)
                                      );
                                    }
                                  }}
                                />
                              </FormControl>
                              <div className="leading-none">
                                <FormLabel className="cursor-pointer">{area.name}</FormLabel>
                                <p className="text-xs text-muted-foreground">{area.city}</p>
                              </div>
                            </FormItem>
                          ))}
                        </div>

                        {/* Everywhere Badge */}
                        <div className="flex justify-center">
                          {selectedAreas.length === 0 ? (
                            <Badge variant="default" className="gap-2 py-2 px-4">
                              <Globe className="h-4 w-4" />
                              Available Everywhere
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              {selectedAreas.length} area{selectedAreas.length > 1 ? "s" : ""} selected
                            </Badge>
                          )}
                        </div>
                      </div>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-6 border-t">
            <Button type="button" variant="outline" onClick={() => navigate("/admin/menu")}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}