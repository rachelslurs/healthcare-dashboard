import { useParams } from '@tanstack/react-router'

export default function PatientDetail() {
  const { patientId } = useParams({ strict: false })
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Patient Detail</h1>
      <p className="text-gray-600">Patient ID: {patientId}</p>
      <p className="text-gray-600">Patient detail will be implemented here</p>
    </div>
  )
}
