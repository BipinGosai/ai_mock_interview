"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import FormField from "./FormField"
import { useRouter } from "next/navigation"
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "@/firebase/client"
import { signIn, signUp } from "@/lib/actions/auth.action"

const authFormSchema = (type: FormType)=>{
  return z.object({
      name: type === 'sign-up' 
        ? z.string()
            .min(3, { message: 'Name must be at least 3 characters' })
            .max(50, { message: 'Name cannot exceed 50 characters' })
        : z.string().optional(),
      email: z.string()
        .min(1, { message: 'Email is required' })
        .max(100, { message: 'Email cannot exceed 100 characters' })
        .email({ message: 'Please enter a valid email address' })
        .refine(email => {
          // Get domain part in lowercase for case-insensitive comparison
          const domain = email.split('@')[1]?.toLowerCase();
          
          // List of allowed email domains
          const allowedDomains = [
            'gmail.com',
            'yahoo.com',
            'outlook.com',
            'hotmail.com',
            'aol.com',
            'icloud.com',
            'protonmail.com',
            'zoho.com',
            'mail.com',
            'gmx.com',
            'yandex.com',
            'live.com',
            'me.com',
            'inbox.com',
            'hubspot.com'
          ];
          
          return allowedDomains.includes(domain);
        }, {
          message: 'Please use an correct email formate.'
        })
        .refine(email => {
          // Check for consecutive dots in domain part
          const domainPart = email.split('@')[1];
          return !/\.{2,}/.test(domainPart);
        }, {
          message: 'Email domain cannot contain consecutive dots'
        }),
      password: z.string()
        .min(8, { message: 'Password must be at least 8 characters' })
        .max(50, { message: 'Password cannot exceed 50 characters' })
        .refine(val => !/\s/.test(val), {
          message: 'Password cannot contain spaces'
        }),
    })
}
// Password requirements for display
const passwordRequirements = [
  { id: 'length', text: 'At least 8 characters' },
  { id: 'nospace', text: 'No spaces allowed' },
];

const AuthForms = ({type}:{type: FormType}) => {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const formSchema = authFormSchema(type);
     // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  })
 
  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    try {
      if(type === 'sign-up'){
        const {name, email, password } = values;
        const userCredentials = await createUserWithEmailAndPassword(auth,email,password);
        const result = await signUp({
          uid: userCredentials.user.uid,
          name: name!,
          email,
          password,
        })
        if(!result?.success){
          toast.error(result?.message);
          return;
        }
        toast.success('Account created successfully.Please Sign-in');
        router.push('/sign-in');
      } else{
        const {email, password} = values;

        const userCredential = await signInWithEmailAndPassword(auth,email,password);

        const idToken = await userCredential.user.getIdToken();

        if(!idToken){
          toast.error('Sign in Failed')
          return;
        }
        await signIn({
          email, idToken
        })
        toast.success('Sign In successfully.');
        router.push('/');
      }
      
    } catch (error) {
        console.log(error);
        toast.error(`There was an error : ${error}`)
    }
    console.log(values)
  }

  const isSignIn = type === 'sign-in';
  return (
    <div className="card-border lg:min-w-[566px]">
        <div className="flex flex-col gap-6 card py-14 px-10">
            <div className="flex flex-row gap-2 justify-center">
                <img src="/logo.svg" alt="logo" height={32} width={38}></img>
                <h2 className="text-primary-100">PrepWise</h2>
            </div>
            <h3>Practice Job Interview with AI</h3>
        <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6 mt-4 form">
        {!isSignIn && (
          <FormField 
              control={form.control}
              name ="name"
              label="Name"
              placeholder="Your Name"
          />
        )}
        <div className="space-y-1">
          <FormField 
            control={form.control}
            name="email"
            label="Email"
            placeholder="your.email@example.com"
            type="email"
          />
          {form.formState.errors.email && (
            <p className="text-sm text-red-600 mt-1">
              {form.formState.errors.email.message}
            </p>
          )}
          {type === 'sign-up' && !form.formState.errors.email && form.watch('email') && (
            <p className="text-xs text-green-600 mt-1">
              ✓ Valid email format
            </p>
          )}
        </div>
        <div className="space-y-2">
          <div className="relative">
            <div className="relative">
              <FormField 
                control={form.control}
                name="password"
                label="Password"
                placeholder="Enter Your Password"
                type={showPassword ? "text" : "password"}
                className="pr-10"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
          
          {type === 'sign-up' && (
            <div className="text-sm text-gray-600 space-y-1 pt-1">
              <p className="font-medium">Password must contain:</p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                {passwordRequirements.map((req) => {
                  let isMet = false;
                  const password = form.watch('password') || '';
                  
                  if (req.id === 'length') {
                    isMet = password.length >= 8;
                  } else if (req.id === 'nospace') {
                    isMet = !/\s/.test(password);
                  }
                  
                  return (
                    <li 
                      key={req.id} 
                      className={`flex items-center ${isMet ? 'text-green-600' : 'text-gray-500'}`}
                    >
                      <span className={`inline-block w-4 h-4 mr-2 ${isMet ? 'text-green-500' : 'text-gray-400'}`}>
                        {isMet ? '✓' : '•'}
                      </span>
                      {req.text}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
          
          {form.formState.errors.password && (
            <p className="text-sm text-red-600 mt-1">
              {form.formState.errors.password.message}
            </p>
          )}
        </div>
        <Button className="btn" type="submit">{isSignIn ? 'Sign in' : 'Create an Account'}</Button>
      </form>
        </Form>

        <p className="text-center">
            {isSignIn ? 'No Account Yet?' : 'Have an Account already?'}
            <Link href={!isSignIn ? '/sign-in' : '/sign-up'} className="font-bold text-user-primary ml-1">
                {!isSignIn ? "Sign in" : "Sign-up"}
            </Link>
        </p>
    </div>
    </div>
  )
}

export default AuthForms