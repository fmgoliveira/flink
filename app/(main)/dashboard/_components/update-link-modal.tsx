"use client";

import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

import { Switch } from "@/components/ui/switch";
import { UpdateLinkInput } from "@/lib/core/links/link.input";
import { Link } from "@prisma/client";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { revalidateHomepage } from "../actions/revalidate-homepage";
import { updateLinkHook } from "./link-functions";

type LinkEditModalProps = {
  link: Link;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function UpdateLinkModal({
  link,
  open,
  setOpen,
}: LinkEditModalProps) {
  const [loading, setLoading] = useState(false);

  const form = useForm<UpdateLinkInput>({
    defaultValues: {
      id: link.id,
      url: link.url!,
      alias: link.alias!,
      disableAfterClicks: link.disableAfterClicks ?? undefined,
      disableAfterDate: link.disableAfterDate ?? undefined,
      keepPath: link.keepPath ?? undefined,
    },
  });

  form.setValue("id", link.id);

  async function onSubmit(values: UpdateLinkInput) {
    setLoading(true);
    try {
      const result = await updateLinkHook(values);
      if (result) {
        toast.success("Link updated successfully");
        await revalidateHomepage();
      }
    } catch (error) {
      console.log(error);
      toast.error(`Failed to updated link: ${error}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Link</DialogTitle>
          <DialogDescription>Make changes to your link here</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Destination URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://site.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="alias"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Link Alias</FormLabel>
                  <FormControl>
                    <section className="flex items-center">
                      <Select>
                        <SelectTrigger className="w-max rounded-br-none rounded-tr-none bg-neutral-50">
                          <SelectValue placeholder="ishortn.ink" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="ishortn.ink">
                              ishortn.ink
                            </SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      <Input
                        placeholder="short-link"
                        className="h-10 flex-grow rounded-bl-none rounded-tl-none"
                        {...field}
                      />
                    </section>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* horizontal line with optional settings */}
            <div className="flex items-center gap-4">
              <div className="flex-grow border-t border-neutral-200" />
              <span className="text-neutral-500">Optional Settings</span>
              <div className="flex-grow border-t border-neutral-200" />
            </div>

            <FormField
              control={form.control}
              name="keepPath"
              render={({ field }) => (
                <FormItem className="flex flex-row gap-2 items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-sm">Keep path</FormLabel>
                    <FormDescription>
                      If on, the path after the alias will be kept. If off,
                      it&apos;ll throw a 404
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="disableAfterClicks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Disable after clicks</FormLabel>
                  <FormControl>
                    <Input {...field} type="number" />
                  </FormControl>
                  <FormDescription>
                    Deactivate the link after a certain number of clicks. Leave
                    empty to never disable
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="disableAfterDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Disable after date</FormLabel>
                  <FormControl>
                    <LinkExpirationDatePicker
                      setSeletectedDate={field.onChange}
                    />
                  </FormControl>
                  <FormDescription>
                    Deactivate the link after a certain date
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="mt-10 w-full"
              onClick={form.handleSubmit(onSubmit)}
              disabled={loading}
            >
              Submit
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

type LinkExpirationDatePickerProps = {
  setSeletectedDate: (date: Date) => void;
};

export function LinkExpirationDatePicker({
  setSeletectedDate,
}: LinkExpirationDatePickerProps) {
  const [date, setDate] = useState<Date>();

  const handleSelect = (date: Date) => {
    setDate(date);
    setSeletectedDate(date);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(date) => handleSelect(date!)}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
