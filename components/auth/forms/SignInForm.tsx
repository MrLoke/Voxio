"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInSchema, SignInFormValues } from "@/lib/schemas/authSchema";
import { signInAction } from "@/actions/auth";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { Mail, AlertCircleIcon } from "lucide-react";
import { PasswordField } from "../ui/PasswordField";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export const SignInForm = () => {
  const form = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: SignInFormValues) => {
    const result = await signInAction(values);

    if (result && result.error) {
      form.setError("root.serverError", {
        type: "manual",
        message: result.error,
      });
    }
  };

  return (
    <div className="w-full max-w-md">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col space-y-4"
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>E-mail</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 dark:text-slate-400 h-5 w-5" />
                    <Input
                      type="email"
                      placeholder="E-mail address"
                      className={cn(
                        "pl-10 text-slate-800 dark:text-slate-100",
                        {
                          "border-red-500": form.formState.errors.email,
                        }
                      )}
                      {...field}
                      disabled={form.formState.isSubmitting}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <PasswordField form={form} name="password" />

          {/* Error from Server Action / Supabase */}
          {form.formState.errors.root?.serverError && (
            <Alert
              variant="destructive"
              className="bg-(--color-muted) border-2 border-(--color-destructive)"
            >
              <AlertCircleIcon size="30px" />
              <AlertTitle>
                {form.formState.errors.root.serverError.message}
              </AlertTitle>
              <AlertDescription>
                <p>The email and/or password you provided is incorrect.</p>
              </AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-900 ring-2 ring-slate-400 dark:ring-slate-600 text-slate-700 dark:text-slate-200 transition-colors hover:cursor-pointer"
          >
            {form.formState.isSubmitting ? "Login..." : "Sign In"}
          </Button>
        </form>
      </Form>
    </div>
  );
};
