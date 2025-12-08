// src/features/menu/components/MenuItemFormModal.tsx
import { useEffect, useState, ChangeEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Upload, Globe, MapPin, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  useCreateMenuItem,
  useUpdateMenuItem,
  useAvailableAreas,
} from "../hooks/useMenuApi";
import { CATEGORY_OPTIONS, type MenuCategory, type MenuItem } from "../types/menu.types";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  description: z.string().max(500).optional(),
  price: z.coerce.number().min(50, "Minimum price is Rs. 50").max(100000),
  category: z.enum(["breakfast", "lunch", "dinner", "desserts", "beverages"]),
  isVeg: z.boolean(),
  isSpicy: z.boolean(),
  isAvailable: z.boolean(),
  availableEverywhere: z.boolean(),
  selectedAreas: z.array(z.string()),
});

type FormData = z.infer<typeof formSchema>;

interface MenuItemFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editItem?: MenuItem | null;
  onSuccess?: () => void;
}

export function MenuItemFormModal({
  open,
  onOpenChange,
  editItem,
  onSuccess,
}: MenuItemFormModalProps) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const createMutation = useCreateMenuItem();
  const updateMutation = useUpdateMenuItem();
  const { data: areasData } = useAvailableAreas();

  const isLoading = createMutation.isPending || updateMutation.isPending;
  const areas = areasData?.areas || [];

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 199,
      category: "lunch",
      isVeg: false,
      isSpicy: false,
      isAvailable: true,
      availableEverywhere: true,
      selectedAreas: [],
    },
  });

  // Reset form when modal opens/closes or item changes
  useEffect(() => {
    if (!open) {
      setImageFile(null);
      setImagePreview(null);
      return;
    }

    if (editItem) {
      form.reset({
        name: editItem.name,
        description: editItem.description || "",
        price: editItem.price,
        category: editItem.category,
        isVeg: editItem.isVeg,
        isSpicy: editItem.isSpicy,
        isAvailable: editItem.isAvailable,
        availableEverywhere: editItem.availableInAreas.length === 0,
        selectedAreas: editItem.availableInAreas || [],
      });
      setImagePreview(editItem.image || null);
    } else {
      form.reset();
      setImagePreview(null);
    }
    setImageFile(null);
  }, [open, editItem, form]);

  const availableEverywhere = form.watch("availableEverywhere");
  const selectedAreas = form.watch("selectedAreas");

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image");
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    toast.info("Image removed");
  };

  const onSubmit = async (data: FormData) => {
    const availableInAreas = data.availableEverywhere ? [] : data.selectedAreas;

    try {
      if (editItem) {
        await updateMutation.mutateAsync({
          id: editItem._id,
          data: {
            name: data.name,
            description: data.description || undefined,
            price: data.price,
            category: data.category as MenuCategory,
            isVeg: data.isVeg,
            isSpicy: data.isSpicy,
            isAvailable: data.isAvailable,
            availableInAreas,
            image: imageFile || undefined,
          },
        });
        toast.success("Item updated!");
      } else {
        if (!imageFile) {
          toast.error("Image is required");
          return;
        }
        await createMutation.mutateAsync({
          name: data.name,
          description: data.description,
          price: data.price,
          category: data.category as MenuCategory,
          isVeg: data.isVeg,
          isSpicy: data.isSpicy,
          availableInAreas,
          image: imageFile,
        });
        toast.success("Item created!");
      }

      onOpenChange(false);
      onSuccess?.();
    } catch (err: any) {
      toast.error(err?.message || "Operation failed");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {editItem ? "Edit Menu Item" : "Add New Menu Item"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Image Section */}
              <div className="space-y-4">
                <Label>Image {editItem ? "(Optional)" : "*"}</Label>
                <div className="relative aspect-square rounded-xl border-2 border-dashed border-muted-foreground/25 bg-muted/50 overflow-hidden">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                      <Upload className="h-12 w-12" />
                    </div>
                  )}
                  {imagePreview && (
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
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="cursor-pointer"
                />
                <p className="text-xs text-muted-foreground">
                  Recommended: 800×800px • JPG/PNG/WebP
                </p>
              </div>

              {/* Form Fields */}
              <div className="md:col-span-2 space-y-6">
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
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Rich and creamy tomato-based curry..."
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
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

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
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
                </div>

                {/* Toggle Options */}
                <div className="flex flex-wrap gap-6">
                  <FormField
                    control={form.control}
                    name="isVeg"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
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
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
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
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer">Available</FormLabel>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Available In Areas */}
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="availableEverywhere"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={(checked) => {
                              field.onChange(checked);
                              if (checked) form.setValue("selectedAreas", []);
                            }}
                          />
                        </FormControl>
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          <FormLabel className="font-normal cursor-pointer">
                            Available Everywhere
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />

                  {!availableEverywhere && (
                    <FormField
                      control={form.control}
                      name="selectedAreas"
                      render={() => (
                        <FormItem>
                          <FormLabel>Select Delivery Areas</FormLabel>
                          <div className="max-h-64 overflow-y-auto rounded-lg border bg-muted/30 p-4">
                            {areas.length === 0 ? (
                              <p className="text-center py-8 text-muted-foreground">
                                No delivery areas defined
                              </p>
                            ) : (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {areas.map((area) => (
                                  <FormItem
                                    key={area.id}
                                    className="flex flex-row items-center space-x-3 space-y-0"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={selectedAreas.includes(area.id)}
                                        onCheckedChange={(checked) => {
                                          if (checked) {
                                            form.setValue("selectedAreas", [...selectedAreas, area.id]);
                                          } else {
                                            form.setValue(
                                              "selectedAreas",
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
                            )}
                          </div>
                          {selectedAreas.length > 0 && (
                            <Badge variant="secondary" className="mt-3">
                              {selectedAreas.length} area{selectedAreas.length > 1 ? "s" : ""} selected
                            </Badge>
                          )}
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-4 pt-6 border-t">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {editItem ? "Updating..." : "Adding..."}
                  </>
                ) : editItem ? (
                  "Update Item"
                ) : (
                  "Add Item"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}