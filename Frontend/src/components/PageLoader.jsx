import { LoaderIcon } from "lucide-react";
import { useThemeStore } from "../Store/useThemeStore";

const PageLoader = ()=>{
  const {theme}= useThemeStore();
  return(
      <div className="min-h-screen flex justify-center items-center" data-theme={theme}>
       <LoaderIcon className="animate-spin size-10 text-primary"/>
    </div>
  )
}
export default PageLoader;