import React, { useState, useEffect } from "react";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithPopup,
  GoogleAuthProvider,
  EmailAuthProvider,
  linkWithCredential,
  deleteUser,
  reauthenticateWithCredential,
  fetchSignInMethodsForEmail,
} from "firebase/auth";
import {
  doc,
  setDoc,
  collection,
  query,
  where,
  getDocs
} from "firebase/firestore";
import { auth, db } from "../firebase/firebaseConfig";
import { useNavigate } from "react-router-dom";
import { storage } from "../firebase/firebaseConfig";
import {ref, uploadBytes} from "firebase/storage";
// allows to randomize letters -> using this for randomizing image names from users
import{v4} from 'uuid';
// import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import "./Customers.css";

function RegisterProvider() {
  /**************************************************************************
   1) STATE HOOKS
   *************************************************************************/
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [availability, setAvailability] = useState([]); //array
  const [imageUrl, setImageUrl] = useState(null); // link to image
  const [portfolioLink, setPortfolioLink] = useState(""); // link to profile
  const [price, setPrice] = useState([]); // array of prices
  const [specialty, setSpecialty] = useState("");
  const [schedule, setSchedule] = useState([]); // schedule of week with free slots
  const [location, setLocation] = useState(""); // Location of the service



  // store password in state so we can reauth if needed
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // If user signs in with Google, store that user object
  const [googleUser, setGoogleUser] = useState(null);

  // For showing errors and success messages in the UI
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // 4-minute timer => 240 seconds
  const [timer, setTimer] = useState(240);
  const [isRegistering, setIsRegistering] = useState(false);

  // Resend is initially disabled; enable after 1 minute
  const [resendDisabled, setResendDisabled] = useState(true);

  // Track if user canceled
  const [isCanceled, setIsCanceled] = useState(false);

  // For navigation
  const navigate = useNavigate();

  // Google auth provider 
  const googleProvider = new GoogleAuthProvider();

  /**************************************************************************
    2) useEffect: CLEAN UP UNVERIFIED USER IF PAGE REFRESHED
   *************************************************************************/
  useEffect(() => {
    const regInProgress = localStorage.getItem("registrationInProgress"); // custom flag to track the state of the registration process and ensures actions (like cleaning up unverified users) are correctly handled even after a page refresh.
    const isGoogleSignup = localStorage.getItem("isGoogleSignup") === "true"; // Check if it's a Google signup
    const savedGoogleUser = JSON.parse(localStorage.getItem("googleUser")); // Retrieve Google user data

    if (regInProgress === "true") {
      const user = auth.currentUser;
    // In here if email verified for users registering with email => they already filled out all the required fields
      if (user && !user.emailVerified) {
        console.log("Page refreshed mid-registration. Attempting to delete user.");
        deleteUser(user)
          .then(() => {
            console.log("Unverified user deleted.");
          })
          .catch((err) => {
            // If deletion fails, just log it and reset
            console.error("Failed to delete user:", err.code, err.message);
          })
          .finally(() => {
            localStorage.removeItem("registrationInProgress");
          });
      }
      // TODO: if refreshed and google provider and did not fill up required fields delete auth
      else if (isGoogleSignup && savedGoogleUser) {
        console.log("Google user detected. Checking if required fields are completed.");
        // If fields are not filled
        const requiredFieldsFilled = localStorage.getItem("googleFieldsFilled") === "true";
  
        if (!requiredFieldsFilled) {
          console.log("Google user did not complete required fields. Deleting user...");
          deleteUser(savedGoogleUser)
            .then(() => {
              console.log("Google user deleted.");
            })
            .catch((err) => {
              console.error("Failed to delete Google user:", err.message);
            })
            .finally(() => {
              localStorage.removeItem("registrationInProgress");
              localStorage.removeItem("isGoogleSignup");
              localStorage.removeItem("googleUser");
            });
        } else {
          console.log("Google user has completed required fields. No action needed.");
          localStorage.removeItem("registrationInProgress");
        }
      } 
      
      else {
        console.log("No unverified user to delete on mount or user is verified.");
        localStorage.removeItem("registrationInProgress");
      }
    }
  }, []);

  /**************************************************************************
   3) useEffect: TIMER LOGIC
   *************************************************************************/
  useEffect(() => {
    let interval;
    if (isRegistering && timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    } 
    else if (timer === 0 && isRegistering) {
      console.log("Timer expired -> handleTimeout");
      handleTimeout();
    }
    return () => clearInterval(interval);
  }, [isRegistering, timer]);

  /**************************************************************************
   4) ENABLE RESEND AFTER 1 MIN
   *************************************************************************/
  useEffect(() => {
    // Timer starts at 240. After 60s, timer=180 => 1 minute passed
    if (isRegistering && timer <= 180) {
      setResendDisabled(false);
    }
  }, [isRegistering, timer]);

  /**************************************************************************
   5) HELPER: Check if Email Already Exists
   *************************************************************************/
  const checkEmailExists = async (email) => {
    // 5a) Check in Auth
    const methods = await fetchSignInMethodsForEmail(auth, email);
    if (methods.length > 0) {
      return true; // Email is already in use in Firebase Auth
    }

    // 5b) Check Firestore "customers" and "providers" collection
    const q = query(collection(db, "providers"), where("email", "==", email));
    const querySnap = await getDocs(q);
    if (!querySnap.empty) {
      // There's a doc with that email
      return true;
    }

    const q2 = query(collection(db, "customers"), where("email", "==", email));
    const querySnap2 = await getDocs(q2);
    if (!querySnap.empty) {
      // There's a doc with that email
      return true;
    }
    return false;
  };

  /**************************************************************************
   6) HELPER: Validate Password
   *************************************************************************/
  const validatePassword = () => {
    if (password !== confirmPassword) {
      return "Passwords do not match.";
    }
    if (password.length < 8) {
      return "Password must be at least 8 characters long.";
    }
    if (!/[A-Z]/.test(password)) {
      return "Password must include at least one uppercase letter.";
    }
    if (!/[a-z]/.test(password)) {
      return "Password must include at least one lowercase letter.";
    }
    if (!/\d/.test(password)) {
      return "Password must include at least one number.";
    }
    return "";
  };

  /**************************************************************************
   7) HELPER: Reauthenticate if needed
   *************************************************************************/
  const reauthenticateUser = async (user, pwd) => {
    if (!pwd) {
      console.warn("No password provided, cannot reauthenticate.");
      return false;
    }
    try {
      const credential = EmailAuthProvider.credential(user.email, pwd);
      await reauthenticateWithCredential(user, credential);
      console.log("Reauthentication successful");
      return true;
    } catch (err) {
      console.error("Reauth failed:", err.code, err.message);
      return false;
    }
  };

  /**************************************************************************
   8) REGISTER
   *************************************************************************/
  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    const validationError = validatePassword();
    if (validationError) {
      setError(validationError);
      return;
    }

    if (!username.trim()) {
        setError("Username is required.");
        return;
      }
    
      // Validate email
      if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
        setError("Please provide a valid email address.");
        return;
      }
    
    
    
      // Validate specialty
      if (!specialty) {
        setError("Please select a specialty.");
        return;
      }

      // Validate location
      if(!location){
        setError("Please select a location.")
        return;
      }
    
      //TODO: IMAGE Validation...


     // Validate image
    //   if (imageUrl==null) {
    //     setError("Please upload an image.");
    //     return;
    //   }
    
      // Validate availability
      if (availability.length === 0) {
        setError("Please provide your availability.");
        return;
      }
    
      // Validate price
      if (price.length === 0) {
        setError("Please provide valid prices");
        return;
      }

      //TODO: What is it we want from the schedule
    
      /* Validate schedule
      if (schedule.length === 0) {
        setError("Please provide at least one available time slot.");
        return;
      } */
    

    // Check if email used
    try {
      const emailExists = await checkEmailExists(email);
      if (emailExists) {
        setError("This email is already in use.");
        return;
      }
    } catch (err) {
      console.error("Email check failed:", err);
      setError("Failed to verify email. Try again.");
      return;
    }

    try {
      setIsRegistering(true); // disable register button
      localStorage.setItem("registrationInProgress", "true"); // set flag to true to track page refreshes

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await sendEmailVerification(user);
      setSuccessMessage("Verification email sent! Please check your inbox.");

      pollForVerification(user);
    } catch (authError) {
      console.error("Registration error:", authError.message);
      setIsRegistering(false); // allow re-try
      if (authError.code === "auth/email-already-in-use") {
        setError("The email address is already in use.");
      } else {
        setError("Failed to register. Please try again.");
      }
    }
  };

  /**************************************************************************
   9) POLL FOR VERIFICATION
   *************************************************************************/
  const pollForVerification = (user) => {
    let canceled = false;

    const checkEmailVerified = async () => {
      if (canceled || isCanceled) return;

      try {
        await user.reload();
        if (user.emailVerified) {
          // Once verified, remove localStorage flag
          localStorage.removeItem("registrationInProgress");

          // Write doc
          await setDoc(doc(db, "providers", user.uid), {
            username,
            email,
            createdAt: new Date(),
            availability,
            imageUrl,
            portfolioLink,
            price,
            specialty,
            schedule,
            location,
          });
          alert("Email verified and customer registered successfully!");
          navigate("/"); // go to home or login
        } else if (timer > 0) {
          setTimeout(checkEmailVerified, 2000); // check again in 2s
        }
      } catch (err) {
        console.error("Error during verification check:", err.code, err.message);
        if (err.code === "auth/user-token-expired") {
          console.warn("User token expired. Stopping verification checks.");
          canceled = true;
        }
      }
    };

    checkEmailVerified();
  };

  /**************************************************************************
   10) TIMEOUT => DELETE UNVERIFIED USER
   *************************************************************************/

   //TODO: Avoid exccessive API calls by debouncing the
   // recursive checkEmailVerified function

  const handleTimeout = async () => {
    setIsRegistering(false);
    setTimer(0);
    setError("Verification time expired. Please register again.");

    const user = auth.currentUser;
    if (!user) {
      console.warn("No user found to delete at timeout.");
      localStorage.removeItem("registrationInProgress");
      return;
    }
    console.log("Timeout -> reauth & delete user:", user.email);

    try {
      // 10a) Reauthenticate user if they used email/password
      const reauthed = await reauthenticateUser(user, password);
      if (!reauthed) {
        console.warn("Could not reauth. Attempting delete anyway...");
      }

      //TODO: Check if this is logical....

      // For Google Users:
      if (googleUser) {
        console.log("Google user detected, deleting account without reauthentication.");
      } else if (password) {
        await reauthenticateUser(user, password);
      }

      await deleteUser(user);
      console.log("Unverified user deleted after 4-min timeout.");
    } catch (err) {
      console.error("Failed to delete user after timeout:", err.code, err.message);

      // Instead of crashing, we reset the flow:
      setError("Verification time expired. Please register again.");
    } finally {
      // Cleanup
      setIsRegistering(false);
      setTimer(240);
      localStorage.removeItem("registrationInProgress");
    }
  };

  /**************************************************************************
   11) CANCEL => DELETE USER
   *************************************************************************/
  const handleCancel = async () => {
    setIsCanceled(true);

    const user = auth.currentUser;
    if (!user) {
      console.warn("No user found on cancel.");
      resetRegistration("Registration canceled. You can register again.");
      return;
    }

    console.log("Cancel -> reauth & delete user:", user.email);
    try {
      const reauthed = await reauthenticateUser(user, password);
      if (!reauthed) {
        console.warn("Could not reauth. Attempting delete anyway...");
      }

      await deleteUser(user);
      console.log("User registration canceled -> user deleted.");
    } catch (err) {
      console.error("Error during cancellation:", err.code, err.message);
      // Instead of crashing, we reset the flow:
      setError("Registration canceled. Please register again.");
    } finally {
      resetRegistration("Registration canceled. You can register again.");
    }
  };

  /**************************************************************************
   11b) HELPER: RESET REGISTRATION FLOW
   *************************************************************************/
  const resetRegistration = (msg) => {
    // Generic helper to clean up user state
    setIsRegistering(false);
    setTimer(240);
    setSuccessMessage("");
    setError(msg);
    localStorage.removeItem("registrationInProgress");
  };

  /**************************************************************************
    12) RESEND VERIFICATION
   *************************************************************************/
  const handleResendVerification = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        await sendEmailVerification(user);
        setSuccessMessage("Verification email resent! Please check your inbox.");
        setResendDisabled(true);

        // Re-enable after 60 seconds
        setTimeout(() => {
          setResendDisabled(false);
        }, 60000);
      }
    } catch (err) {
      console.error("Error resending verification email:", err.message);
      setError("Failed to resend verification email. Please try again.");
    }
  };

  /* TODO: add and remove registration in progress flag for google 
  sigunup !!! */

  /**************************************************************************
    13) GOOGLE SIGNUP 
   *************************************************************************/
  const handleGoogleSignup = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      if (result._tokenResponse.isNewUser) {
        setGoogleUser(user);
        setIsRegistering(true);
        localStorage.setItem("registrationInProgress", "true");
        alert("Google account authenticated! Please set additional details.");
      } else {
        setError("This Google account is already linked to another login method.");
      }
    } catch (err) {
      console.error("Google Sign-Up Error:", err.code, err.message);
      if (err.code === "auth/email-already-in-use") {
        setError("This email is already registered. Please log in or reset your password.");
      } else {
        setError("Failed to sign up with Google. Please try again.");
      }
    }
  };

  /**************************************************************************
    14) SET PASSWORD IF USER SIGNED UP WITH GOOGLE
   *************************************************************************/
  const handleSetPassword = async (e) => {
    e.preventDefault();
    setError("");

    const validationError = validatePassword();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      if (!googleUser) {
        setError("Google authentication is required before setting a password.");
        return;
      }
      const credential = EmailAuthProvider.credential(googleUser.email, password);
      await linkWithCredential(googleUser, credential);

      await setDoc(doc(db, "providers", googleUser.uid), {
        username: username || googleUser.displayName,
        email: googleUser.email,
        createdAt: new Date(),
        availability,
        imageUrl,
        portfolioLink,
        price,
        specialty,
        schedule,
        location,
       
      });
      localStorage.setItem("googleFieldsFilled", "true"); // Mark fields as completed
      alert("Account linked successfully! You can now log in with email and password.");
      navigate("/");
    } catch (err) {
      console.error("Error linking password:", err.message);
      if (err.code === "auth/credential-already-in-use") {
        setError("This Google account is already linked to an email account.");
      } else {
        setError("Failed to set password. Please try again.");
      }
    }
  };

   /**************************************************************************
    15) Handle Image storage
   *************************************************************************/
    // const handleImageUpload =() =>{
    //     if(imageUrl==null){
    //         return;
    //     }
    //     // reference to file uploads is the images bucket storage
    //     // making file name -> file name from user + random characters
    //     const imageRef = ref(storage, 'images/${imageUrl.name + v4()}');

    //     // Uploading image to firebase
    //     uploadBytes(imageRef, imageUrl).then(() => {
    //         alert("Image uploaded");
    //     })

        /*TODO: create a storage in firestore */

        /* TODO: Link image and save to user imgage column in the providers database*/

        /*TODO: allow only the latest image uploaded, one image! if they upload another image only
        save the latest one */

        /*TODO: After approval of admin, display image in the home page under their name */

    // }
    // const storage = getStorage();
    
    // const handleImageUpload = (e) => {
    //     const file = e.target.files[0];
    //     if (!file) {
    //         setError("Please select an image file.");
    //         return;
    //     }
        
    //     const storageRef = ref(storage, `customer-images/${file.name}`);
    //     const uploadTask = uploadBytesResumable(storageRef, file);
        
    //     uploadTask.on(
    //         "state_changed",
    //         (snapshot) => {
    //             const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
    //             console.log(`Upload is ${progress}% done`);
    //         },
    //         (error) => {
    //             console.error("Image upload failed:", error.message);
    //             setError("Failed to upload image. Please try again.");
    //         },
    //         async () => {
    //             // Upload completed successfully
    //             try {
    //                 const url = await getDownloadURL(uploadTask.snapshot.ref);
    //                 setImageUrl(url);
    //                 console.log("Image uploaded successfully. URL:", url);
    //             } catch (err) {
    //                 console.error("Failed to get download URL:", err.message);
    //                 setError("Failed to get image URL. Please try again.");
    //             }
    //          }
    //         );
    //     };


  /**************************************************************************
    16) RENDER
   *************************************************************************/
    return (
        <main>
            <section className="hero">
            <div className="container mt-5 register-container">
        <div className="row justify-content-center">
            <div className="col-lg-6 col-md-8 col-sm-10">
                <h1 className="text-center mb-4 register-title">Join as Provider</h1>
                
                {/* Error & Success UI */}
                {error && <div className="alert alert-danger">{error}</div>}
                {successMessage && <div className="alert alert-success">{successMessage}</div>}
                
                {/* If googleUser is null, show standard signup */}
                {!googleUser ? (
                    <form onSubmit={handleRegister} className="register-form">
                        {/* USERNAME */}
                        <div className="mb-3">
                            <label className="form-label">Username</label>
                            <input
                            type="text"
                            className="form-control"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            />
                            
                        </div>
                        
                        {/* EMAIL */}
                        <div className="mb-3">
                            <label className="form-label">Email</label>
                            <input
                            type="email"
                            className="form-control"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                             />
                        </div>

                         {/* PASSWORD */}
                         <div className="mb-3">
                            <label className="form-label">Password</label>
                            <input
                            type="password"
                            className="form-control"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={isRegistering}
                            />
                        </div>

                          {/* CONFIRM PASSWORD */}
                        <div className="mb-3">
                            <label className="form-label">Confirm Password</label>
                            <input
                            type="password"
                            className="form-control"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            disabled={isRegistering}
                            />
                        </div>
                        {/* additional input for provider extra details*/}
                                {/* AVAILABILITY */}
                                <div className="mb-3">
                                    <label className="form-label">Availability (comma-separated)</label>
                                    <input
                                    type="text"
                                    className="form-control"
                                    value={availability}
                                    onChange={(e) => setAvailability(e.target.value.split(","))}
                                    placeholder="e.g., Monday 4-8pm, Tuesday 8-10am, Friday 6-7pm"
                                    required
                                    />
                                </div>
                                {/* TODO: IMAGE UPLOAD and Storage bucket */}


                                {/* IMAGE UPLOAD */}
                                {/* <div className="mb-3">
                                    <label className="form-label">Upload Image</label>
                                    <input
                                    type="file"
                                    className="form-control"
                                    // attempting to take the first file and call handle image upload
                                    onChange={(e) => {setImageUrl(e.target.files[0]), handleImageUpload()}}
                                    accept="image/*"
                                    placeholder="image to be placed on our website. Image of you or your work."
                                    required
                                    />
                                    </div> */}

                                
                                {/* PORTFOLIO LINK */}
                                <div className="mb-3">
                                    <label className="form-label">Portfolio Link</label>
                                    <input
                                    type="url"
                                    className="form-control"
                                    value={portfolioLink}
                                    onChange={(e) => setPortfolioLink(e.target.value)}
                                    placeholder="Enter portfolio link ex: instagram profile"
                                    />
                                </div>
                                
                                {/* PRICE */}
                                <div className="mb-3">
                                    <label className="form-label">Price (comma-separated)</label>
                                    <input
                                    type="text"
                                    className="form-control"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value.split(","))}
                                    placeholder="e.g., 1 person: $50, 2 people: $98, 3+: 20% discount"
                                    required
                                    />
                                </div>
                                
                                {/* SPECIALTY */}
                                <div className="mb-3">
                                    <label className="form-label">Specialty</label>
                                    <select
                                    className="form-control"
                                    value={specialty}
                                    onChange={(e) => setSpecialty(e.target.value)}
                                    required
                                    >
                                        <option value="" disabled>
                                            Select a specialty
                                        </option>
                                        <option value="Photographer">Photographer</option>
                                        <option value="Nail Stylist">Nail Stylist</option>
                                        <option value="Barber">Barber/hair Stylist</option>
                                        </select>
                                </div>

                                {/* Location */}
                                <div className="mb-3">
                                    <label className="form-label">Location</label>
                                    <select
                                    className="form-control"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    required
                                    >
                                        <option value="" disabled>
                                            Select your service location
                                        </option>
                                        <option value="Charlottesville, VA">Charlottesville,VA</option>
                                        </select>
                                </div>
                                
                                {/* SCHEDULE */}
                                <div className="mb-3">
                                    <label className="form-label">Schedule (comma-separated)</label>
                                    <input
                                    type="text"
                                    className="form-control"
                                    value={schedule}
                                    onChange={(e) => setSchedule(e.target.value.split(","))}
                                    placeholder="e.g., 9:00-10:00, 13:00-14:00"
                                    />
                                </div>

                    {/* REGISTER BUTTON */}
                    <button
                    type="submit"
                    className="btn register-button w-100"
                    disabled={isRegistering}
                    >
                    Register
                    </button>

                    {/* Google Sign-up Button */}
                    <button
                    type="button"
                    className="btn google-button w-100 mt-3"
                    onClick={handleGoogleSignup}
                    >
                    Sign Up with Google
                    </button>
                    </form>
                    ) : (
                        
                        /* If googleUser is set, show "Set Password" form */
                        <form onSubmit={handleSetPassword} className="register-form">
                            <div className="mb-3">
                                <label className="form-label">Username</label>
                                <input
                                type="text"
                                className="form-control"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder={googleUser.displayName || "Enter your username"}
                                required
                                />
                            </div>
                            
                            <div className="mb-3">
                                <label className="form-label">Set Password</label>
                                <input
                                type="password"
                                className="form-control"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                />
                                
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Confirm Password</label>
                                <input
                                type="password"
                                className="form-control"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                />
                                </div>

                                {/* additional input for provider extra details*/}
                                {/* AVAILABILITY */}
                                <div className="mb-3">
                                    <label className="form-label">Availability (comma-separated)</label>
                                    <input
                                    type="text"
                                    className="form-control"
                                    value={availability}
                                    onChange={(e) => setAvailability(e.target.value.split(","))}
                                    placeholder="e.g., Monday 4-8pm, Tuesday 8-10am, Friday 6-7pm"
                                    required
                                    />
                                </div>
                                
                                {/*TODO: add image and storage */}


                                {/* IMAGE UPLOAD
                                <div className="mb-3">
                                    <label className="form-label">Upload Image</label>
                                    <input
                                    type="file"
                                    className="form-control"
                                    // onChange={(e) => handleImageUpload(e)}
                                    accept="image/*"
                                    placeholder="image to be placed on our website. Image of you or your work."
                                    required
                                    />
                                    </div> */}

                                
                                {/* PORTFOLIO LINK */}
                                <div className="mb-3">
                                    <label className="form-label">Portfolio Link</label>
                                    <input
                                    type="url"
                                    className="form-control"
                                    value={portfolioLink}
                                    onChange={(e) => setPortfolioLink(e.target.value)}
                                    placeholder="Enter portfolio link ex: instagram profile"
                                    />
                                </div>
                                
                                {/* PRICE */}
                                <div className="mb-3">
                                    <label className="form-label">Price (comma-separated)</label>
                                    <input
                                    type="text"
                                    className="form-control"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value.split(","))}
                                    placeholder="e.g., 1 person: $50, 2 people: $98, 3+: 20% discount"
                                    required
                                    />
                                </div>
                                
                                {/* SPECIALTY */}
                                <div className="mb-3">
                                    <label className="form-label">Specialty</label>
                                    <select
                                    className="form-control"
                                    value={specialty}
                                    onChange={(e) => setSpecialty(e.target.value)}
                                    required
                                    >
                                        <option value="" disabled>
                                            Select a specialty
                                        </option>
                                        <option value="Photographer">Photographer</option>
                                        <option value="Nail Stylist">Nail Stylist</option>
                                        <option value="Barber">Barber/hair Stylist</option>
                                        </select>
                                </div>

                                {/* Location */}
                                <div className="mb-3">
                                    <label className="form-label">Location</label>
                                    <select
                                    className="form-control"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    required
                                    >
                                        <option value="" disabled>
                                            Select your service location
                                        </option>
                                        <option value="Charlottesville, VA">Charlottesville,VA</option>
                                        </select>
                                </div>
                                
                                {/* SCHEDULE */}
                                <div className="mb-3">
                                    <label className="form-label">Schedule (comma-separated)</label>
                                    <input
                                    type="text"
                                    className="form-control"
                                    value={schedule}
                                    onChange={(e) => setSchedule(e.target.value.split(","))}
                                    placeholder="e.g., 9:00-10:00, 13:00-14:00"
                                    />
                                </div>
                                <button type="submit" className="btn register-button w-100">Set Password</button>
                        </form>
                    )}
                    
                    
                    {/* If we're in the "registering" phase, show timer/resend/cancel UI */}
                    
                    {isRegistering && (
                        <div className="mt-3">
                            <p className="text-center">
                                Verification email sent! Please verify your email.
                            </p>
                            <p className="text-center">
                                    Time remaining: {Math.floor(timer / 60)}:{String(timer % 60).padStart(2, "0")}
                            </p>
                            <button
                            className="btn resend-button w-100"
                            onClick={handleResendVerification}
                            disabled={resendDisabled}
                            >
                                Resend Verification Email
                            </button>
                            
                            <button
                            className="btn cancel-button w-100 mt-3"
                            onClick={handleCancel}
                            >
                                Cancel Registration
                            </button>
                        </div>
                    )}
            </div>
        </div>
    </div>
            </section>
        </main>
    
        );
}

export default RegisterProvider;
