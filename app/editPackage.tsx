import EditPackage from "../src/screens/package/EditPackage";
import MainLayout from "../src/layout/MainLayout"; // Importa tu nuevo layout

export default function editPackagePage() {
    return (
        <MainLayout>
            <EditPackage />
        </MainLayout>
    );
}