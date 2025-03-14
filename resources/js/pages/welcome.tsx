import NavBar from "./navBar";

export default function Welcome() {
    

    return (
        <>
            <NavBar/>
           <div className="h-screen flex justify-center items-center">
                <div className="text-md text-center text-4xl text-blue-900">
                    Welcome to Haven Scape
                </div>
            </div>
        </>
    );
}
