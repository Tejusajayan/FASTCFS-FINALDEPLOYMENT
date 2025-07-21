import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { insertUserSchema } from "@shared/schema";
import { z } from "zod";
import { Loader2, Ship, Truck, Plane } from "lucide-react";
import fastCfsLogo from "@assets/FAST CFS Logo - PNG_1752129714357.png";
import { useToast } from "@/hooks/use-toast";
import { Helmet } from "react-helmet-async";
const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginData = z.infer<typeof loginSchema>;
type RegisterData = z.infer<typeof insertUserSchema>;

export default function AuthPage() {
  const { user, loginMutation, registerMutation, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("login");
  const [redirecting, setRedirecting] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const { toast } = useToast();

  // Always call hooks at the top level
  const loginForm = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterData>({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      username: "",
      password: "",
      // Add other fields from insertUserSchema if required
    },
  });

  // Redirect to dashboard if already logged in or after login
  useEffect(() => {
    if (user) {
      setRedirecting(true);
      window.location.assign("/admin");
    }
  }, [user]);

  // Show loading spinner while checking auth or redirecting
  if (isLoading || user || redirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-fast-blue to-fast-blue-dark">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  const onLoginSubmit = (data: LoginData) => {
    loginMutation.mutate(data, {
      onSuccess: () => {
        window.location.assign("/admin");
      }
    });
  };

  const onRegisterSubmit = (data: RegisterData) => {
    registerMutation.mutate(data, {
      onSuccess: () => {
        setRegisterSuccess(true);
        setActiveTab("login");
        toast({
          title: "Account created",
          description: "Your account has been created successfully. You can now log in.",
        });
      }
    });
  };

  return (

    <div className="min-h-screen bg-gradient-to-br from-fast-blue to-fast-blue-dark flex">
      {/* Left side - Auth forms */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <img src={fastCfsLogo} alt="FAST CFS" className="h-12 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">Admin Portal</h1>
            <p className="text-fastblue">Access your logistics management dashboard</p>
          </div>

          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="text-center">Admin Access</CardTitle>
              <CardDescription className="text-center">
                Sign in to manage your logistics operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  {/* <TabsTrigger value="register">Register</TabsTrigger> */}
                </TabsList>

                <TabsContent value="login" className="space-y-4">
                  {registerSuccess && (
                    <div className="mb-4 p-3 rounded bg-green-100 text-green-800 text-center text-sm font-medium">
                      Account created successfully! You can now log in.
                    </div>
                  )}
                  <Form {...(loginForm as any)}>
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your username" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Enter your password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button 
                        type="submit" 
                        className="w-full bg-fast-blue hover:bg-fast-blue-dark"
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Sign In
                      </Button>
                    </form>
                  </Form>
                </TabsContent>

                {/* COMMENT FOR HIDING REGISTER TAB STARTS HERE */}
                <TabsContent value="register" className="space-y-4">
                  <Form {...(registerForm as any)}>
                    <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                      <FormField
                        control={registerForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="Choose a username" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Choose a password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button 
                        type="submit" 
                        className="w-full bg-fast-blue hover:bg-fast-blue-dark"
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Create Account
                      </Button>
                    </form>
                  </Form>
                </TabsContent>
                {/* COMMENT FOR HIDING REGISTER TAB STARTS HERE */}
              
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right side - Hero section */}
      <div className="flex-1 relative overflow-hidden hidden lg:block">
        <div className="absolute inset-0 bg-black/20"></div>
        <img
          src="https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
          alt="Container ships at modern port"
          className="absolute inset-0 w-full h-full object-cover"
        />
        
        <div className="relative z-10 h-full flex flex-col justify-center p-12 text-white">
          <h2 className="text-4xl font-bold mb-6">
            Manage Global Logistics
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Comprehensive admin dashboard for cargo tracking, customer management, 
            and operational oversight across Dubai and Africa.
          </p>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Ship className="h-6 w-6 text-african-gold" />
              <span>Ocean & Air Freight Management</span>
            </div>
            <div className="flex items-center space-x-3">
              <Truck className="h-6 w-6 text-african-gold" />
              <span>Real-time Cargo Tracking</span>
            </div>
            <div className="flex items-center space-x-3">
              <Plane className="h-6 w-6 text-african-gold" />
              <span>Multi-branch Operations</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}