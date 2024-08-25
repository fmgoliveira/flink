"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDebounce } from "use-debounce";

import { Button } from "@/components/ui/button";
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
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Switch } from "@/components/ui/switch";
import { CreateLinkInput } from "@/lib/core/links/link.input";
import { CustomDomain } from "@prisma/client";
import { toast } from "sonner";
import { LinkExpirationDatePicker } from "../../_components/update-link-modal";
import { revalidateHomepage } from "../../actions/revalidate-homepage";
import {
  checkAliasAvailabilityHook,
  createLinkHook,
  getDomains,
} from "./create-link";

export default function CreateLinkPage() {
  const router = useRouter();
  const [destinationURL, setDestinationURL] = useState<string | undefined>();
  const [userDomains, setUserDomains] = useState<CustomDomain[]>([]);
  const [metaData, setMetaData] = useState({
    title: "",
    description: "",
    image: "",
    favicon: "",
  });
  const [loading, setLoading] = useState(false);

  const form = useForm<CreateLinkInput>();

  const [debouncedUrl] = useDebounce(destinationURL, 500);
  const [debouncedAlias] = useDebounce(form.watch("alias"), 500);
  const selectedDomain =
    form.watch("domain") ?? process.env.NEXT_PUBLIC_SHORT_DOMAIN!;

  useEffect(() => {
    getDomains().then((data) => setUserDomains(data));
  }, []);

  useEffect(() => {
    if (debouncedAlias) {
      checkAliasAvailabilityHook({
        alias: debouncedAlias,
        domain: selectedDomain,
      }).then((data) => {
        if (!data.isAvailable)
          form.setError("alias", { message: "Alias ia already taken." });
        else form.clearErrors("alias");
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedAlias, selectedDomain]);

  async function onSubmit(values: CreateLinkInput) {
    setLoading(true);
    try {
      const result = await createLinkHook(values);
      if (result) {
        await revalidateHomepage();
        toast.success("Link created successfully");
        router.push("/dashboard");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong while trying to create the link");
      return;
    }
  }

  useEffect(() => {
    if (form.formState.errors.url ?? !form.getValues("url")) {
      return;
    }

    async function fetchMetadata() {
      const retrievedMetadata = await fetch(
        "https://meta.kelvinamoaba.com/metadata?url=" + debouncedUrl
      );
      const metadata = (await retrievedMetadata.json()) as Metadata;

      if (metadata) {
        setMetaData(metadata);
      }
    }

    fetchMetadata().catch((error) => {
      console.error(error);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedUrl]);

  return (
    <section className="grid grid-cols-1 gap-5 md:grid-cols-11">
      <div className="md:col-span-5">
        <h2 className="text-2xl font-semibold text-neutral-100">
          Create a new link
        </h2>
        <p className="mt-1 text-sm text-neutral-400">
          Create a new link to share with your audience.
        </p>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="mt-5 space-y-5"
          >
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Destination URL <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://site.com"
                      {...field}
                      onChange={(e) => {
                        setDestinationURL(e.target.value);
                        field.onChange(e);
                      }}
                    />
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
                      <Select
                        onValueChange={(value) => {
                          form.setValue("domain", value);
                        }}
                        defaultValue={process.env.NEXT_PUBLIC_SHORT_DOMAIN!}
                      >
                        <SelectTrigger className="w-max rounded-br-none rounded-tr-none">
                          <SelectValue
                            placeholder={process.env.NEXT_PUBLIC_SHORT_DOMAIN}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem
                              value={process.env.NEXT_PUBLIC_SHORT_DOMAIN!}
                            >
                              {process.env.NEXT_PUBLIC_SHORT_DOMAIN}
                            </SelectItem>
                            {userDomains.length > 0 && (
                              <>
                                {userDomains.map((domain) => (
                                  <SelectItem
                                    key={domain.id}
                                    value={domain.domain!}
                                  >
                                    {domain.domain}
                                  </SelectItem>
                                ))}
                              </>
                            )}
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

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input {...field} type="password" />
                  </FormControl>
                  <FormDescription>
                    Set a password to protect your link. Users will be prompted
                    to enter the password before being redirected
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
      </div>
      <div className="hidden items-center justify-center md:flex">
        <div className="h-full border-r border-neutral-200" />
      </div>
      <div className="mt-4 flex flex-col gap-4 md:col-span-5 md:mt-0">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl">How users see your link</h1>
          <p className="text-sm text-neutral-400">
            This is how your link will be displayed to users on social platforms
          </p>
        </div>
        <LinkPreviewComponent
          destinationURL={form.getValues("url")}
          metaTitle={metaData.title}
          metaDescription={metaData.description}
          metaImage={metaData.image}
          favicon={metaData.favicon}
        />
      </div>
    </section>
  );
}

function LinkPreviewComponent({
  destinationURL,
  metaTitle,
  metaDescription,
  metaImage,
  favicon,
}: {
  destinationURL: string | undefined;
  metaTitle: string;
  metaDescription: string;
  metaImage: string;
  favicon: string;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border bg-neutral-900 p-5">
      <div className="flex items-center font-semibold">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={favicon || "https://via.placeholder.com/1200x630"}
          className="mr-2 h-6 w-6 rounded-md"
          alt="Favicon"
        />
        {metaTitle || "Title"}
      </div>
      <span className="text-sm">{metaDescription || "Description"}</span>
      <span className="text-sm text-neutral-400">
        {destinationURL?.replace(/(^\w+:|^)\/\//, "").split("/")[0]}
      </span>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={metaImage || "https://via.placeholder.com/1200x630"}
        className="w-full rounded-lg"
        alt="Link preview"
      />
    </div>
  );
}

type Metadata = {
  title: string;
  description: string;
  image: string;
  favicon: string;
};
