import React, { useState } from "react";
import { ShipWheelIcon } from "lucide-react";
import { Link } from "react-router";
import useSignUp from "../hooks/useSignup";
const SignupPage = () => {
  const [signupData, setSignupData] = useState({
    fullName: "",
    email: "",
    password: "",
  });


  const {isPending, error, signupMutation} = useSignUp();
  const handlesSignup = (e) => {
    e.preventDefault();
    signupMutation(signupData)
  };

  return (
    <div
      className="h-screen flex justify-center items-center p-4 sm:p-6 md:p-8"
      data-theme=""
    >
      <div
        className="border border-primary flex flex-col lg:flex-row w-full max-w-5xl mx-auto bg-base-100
        rounded-xl shadow-lg overflow-hidden"
      >
        {/* left side of signup */}

            <div className="w-full lg:w-1/2 p-4 sm:p-8 flex flex-col">
            
              <div className="mb-4 flex justify-start items-center gap-2">
                <ShipWheelIcon className="w-9 h-9 text-blue-300" />

                <span
                  className="
                          text-3xl
                            font-bold
                            font-mono
                            bg-clip-text
                            text-transparent
                            bg-linear-to-r
                            from-blue-300
                            to-cyan-600
                            tracking-wider
                            uppercase
                        "
                >
                  Talk Meet
                </span>
              </div>
           
              {error && (
                 <div className="alert alert-error mb-4">
                    <span>
                      {error.response.data.message}
                    </span>
                 </div>
              )}
              
            <div className="w-full">
                <form onSubmit={handlesSignup}>
                    <div className="space-y-4">
                         <div>
                          <h2 className="">Create An Account</h2>
                          <p className="text-sm opacity-70">
                            Join Talk Meet And start your language learning adventure!
                          </p>
                         </div>

                         <div className="space-y-3">

                          {/* Full Name */}

                            <div className="form-control w-full">
                                 <label className="label">
                                  <span className="label-text">Full Name</span>
                                 </label>

                                 <input type="text"
                                  placeholder="yuvraj singh" 
                                 className="input input-bordered w-full"
                                 value={signupData.fullName} 
                                 onChange={(e)=> setSignupData({...signupData, fullName: e.target.value})}/>
                            </div>  
                                {/* EMAIL  */}
                               <div className="form-control w-full">
                                 <label className="label">
                                  <span className="label-text">Email</span>
                                 </label>

                                 <input type="email"
                                  placeholder="yuvrajsingh@gmail.com" 
                                 className="input input-bordered w-full"
                                 value={signupData.email} 
                                 onChange={(e)=> setSignupData({...signupData, email: e.target.value})}/>
                            </div>  
                            {/* Password  */}
                             <div className="form-control w-full">
                                 <label className="label">
                                  <span className="label-text">Password</span>
                                 </label>

                                 <input type="password"
                                  placeholder="*******" 
                                 className="input input-bordered w-full"
                                 value={signupData.password} 
                                 onChange={(e)=> setSignupData({...signupData, password: e.target.value})}
                                 required/>

                                 <p className="text-xs opacity-70 m-1">
                                  password must have be at least 6 character long
                                 </p>
                            </div>
                                <div className="form-control w-full">
                                 <label className="label cursor-pointer justify-start gap-2">
                                   <input type="checkbox" className="checkbox checkbox-sm" required/>
                                   <span className="text-xs leading-tight">
                                    i agree to the {" "}
                                    <span className="text-accent hover:underline">terms of services </span> and{" "}
                                   <span className="text-accent hover:underline">privacy policy </span>
                                   </span>
                                  </label>
                            </div>  
                         </div>
                          <button className="btn btn-info w-full " type="submit">
                           {isPending?(
                            <>
                             <span className="loading loading-spinner loading-xs">
                                 loading.....
                             </span>
                            </>
                           ):( "Create Account")}
                          </button>
                          <div className="text-center mt-4">
                            <p className="text-sm">
                              Already have an account?{" "}
                               <Link to="/login" className="text-info hover:underline">
                                 Sign In
                               </Link>
                            </p>
                          </div>

                    </div>
                </form>
            </div>
          
       
           </div>

            

           {/* Right side of signup */}

           <div className="hidden lg:flex w-full lg:w-1/2 bg-cyan-500/20 items-center justify-center">
              <div className="max-w-md p-8">
                 <div className="aspect-square max-w-sm mx-auto relative">
                     <img src="../../public/Video call-bro.png" alt="Language connection illustration "
                      className="w-full h-full" />
                 </div>

                 <div className="text-center space-y-3 mt-6">
                    <h2 className="text-xl font-semibold">
                      Connect with language partners worldwide 
                    </h2>
                    <p className="opacity-70">
                      practice conversations, make friends and improve your language skills
                    </p>
                 </div>
              </div>
           </div>
      </div>
    </div>
  );
};

export default SignupPage;
