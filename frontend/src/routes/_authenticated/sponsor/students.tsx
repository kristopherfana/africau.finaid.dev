import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Mail, Phone, GraduationCap, Calendar } from 'lucide-react'

function SponsorStudents() {
  const students = [
    {
      id: '1',
      name: 'John Mukasa',
      email: 'john.mukasa@africau.edu',
      program: 'Computer Science',
      year: '3rd Year',
      gpa: '3.8',
      status: 'Active',
      avatar: '/avatars/student1.jpg',
      enrollmentDate: '2022-09-01',
    },
    {
      id: '2',
      name: 'Mary Chitate',
      email: 'mary.chitate@africau.edu',
      program: 'Business Administration',
      year: '2nd Year',
      gpa: '3.9',
      status: 'Active',
      avatar: '/avatars/student2.jpg',
      enrollmentDate: '2023-09-01',
    },
    {
      id: '3',
      name: 'David Nyirenda',
      email: 'david.nyirenda@africau.edu',
      program: 'Engineering',
      year: '4th Year',
      gpa: '3.7',
      status: 'Graduating',
      avatar: '/avatars/student3.jpg',
      enrollmentDate: '2021-09-01',
    },
    {
      id: '4',
      name: 'Grace Mutindi',
      email: 'grace.mutindi@africau.edu',
      program: 'Medicine',
      year: '1st Year',
      gpa: '3.9',
      status: 'Active',
      avatar: '/avatars/student4.jpg',
      enrollmentDate: '2024-09-01',
    }
  ]

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Sponsored Students</h2>
          <p className="text-muted-foreground">
            Students benefiting from your scholarship funding
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {students.map((student) => (
          <Card key={student.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={student.avatar} alt={student.name} />
                  <AvatarFallback>
                    {student.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-lg">{student.name}</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <Mail className="h-3 w-3" />
                    {student.email}
                  </CardDescription>
                </div>
                <Badge 
                  variant={student.status === 'Active' ? 'default' : 'secondary'}
                >
                  {student.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{student.program}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{student.year}</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center pt-2">
                <div className="text-sm">
                  <span className="font-medium">GPA: </span>
                  <span className={`font-bold ${
                    parseFloat(student.gpa) >= 3.5 ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    {student.gpa}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Mail className="h-3 w-3 mr-1" />
                    Contact
                  </Button>
                  <Button variant="outline" size="sm">
                    View Profile
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export const Route = createFileRoute('/_authenticated/sponsor/students')({
  component: SponsorStudents,
})