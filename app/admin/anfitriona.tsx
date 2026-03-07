import MainLayout from "../../src/layout/MainLayout";
import AnfitrionaScreen from "@/src/screens/user/anfitriona/AnfitrionaScreen";

export default function createPackage() {
    return (
        <MainLayout>
            <AnfitrionaScreen />
        </MainLayout>
    );
}