import EditPrescriptionForm from './edit-form'

export default async function EditPrescriptionPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params

    return <EditPrescriptionForm prescriptionId={id} />
}
