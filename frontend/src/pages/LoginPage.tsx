import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BusFront } from "lucide-react";
import { useAuth } from "@/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, Input, Label } from "@/components/ui/primitives";

const schema = z.object({ email: z.string().email(), password: z.string().min(8) });
type FormValues = z.infer<typeof schema>;

export function LoginPage() {
  const { login } = useAuth();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "manager@transitops.local", password: "TransitOps@123" }
  });

  return (
    <div className="grid min-h-screen place-items-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="mb-2 flex items-center gap-2">
            <BusFront className="h-7 w-7 text-primary" />
            <div>
              <CardTitle>TransitOps</CardTitle>
              <p className="text-sm text-muted-foreground">Smart transport operations platform</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit((values) => login(values.email, values.password))}>
            <div>
              <Label>Email</Label>
              <Input className="mt-1" {...register("email")} />
              {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <div>
              <Label>Password</Label>
              <Input className="mt-1" type="password" {...register("password")} />
              {errors.password && <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>}
            </div>
            <Button className="w-full" disabled={isSubmitting}>Sign in</Button>
          </form>
          <div className="mt-5 rounded-md border bg-muted/30 p-3 text-xs text-muted-foreground">
            Demo accounts: manager, driver, safety, finance at <span className="font-medium text-foreground">@transitops.local</span>. Password: <span className="font-medium text-foreground">TransitOps@123</span>.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
