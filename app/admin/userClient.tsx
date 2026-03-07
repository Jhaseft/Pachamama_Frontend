import ClientsScreen from "../../src/screens/user/client/ClientsScreen";
import MainLayout from "../../src/layout/MainLayout";

export default function createPackage() {
    return (
        <MainLayout>
            <ClientsScreen />
        </MainLayout>
    );
}