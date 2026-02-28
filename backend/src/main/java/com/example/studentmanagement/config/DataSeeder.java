package com.example.studentmanagement.config;

import com.example.studentmanagement.Notification;
import com.example.studentmanagement.Mark;
import com.example.studentmanagement.Role;
import com.example.studentmanagement.Student;
import com.example.studentmanagement.User;
import com.example.studentmanagement.repository.NotificationRepository;
import com.example.studentmanagement.repository.AssignmentRepository;
import com.example.studentmanagement.repository.AttendanceRepository;
import com.example.studentmanagement.repository.LeaveRepository;
import com.example.studentmanagement.repository.MarkRepository;
import com.example.studentmanagement.repository.StudentRepository;
import com.example.studentmanagement.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import org.springframework.transaction.support.TransactionTemplate;

import java.util.Arrays;
import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private MarkRepository markRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private AssignmentRepository assignmentRepository;

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private LeaveRepository leaveRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private TransactionTemplate transactionTemplate;

    @Override
    public void run(String... args) throws Exception {
        transactionTemplate.execute(status -> {
            // deleteAllStudents(); // Uncomment to wipe all student data on startup
            deleteAllStudents();
            seedMarks(); // Uncommented to seed marks
            seedAnnouncements();
            cleanUpOrphanedStudents();
            return null;
        });
    }

    private void seedMarks() {
        // Create or Update Admin User
        User admin = userRepository.findByUsername("admin").orElse(new User());
        admin.setUsername("admin");
        admin.setPassword(passwordEncoder.encode("admin"));
        admin.setRole(Role.ADMIN);
        userRepository.save(admin);
        System.out.println("Upserted admin: admin");

        // Create or Update Staff User
        User staff = userRepository.findByUsername("staff").orElse(new User());
        staff.setUsername("staff");
        staff.setPassword(passwordEncoder.encode("staff"));
        staff.setRole(Role.STAFF);
        userRepository.save(staff);
        System.out.println("Upserted staff: staff");

        List<StudentData> data = Arrays.asList(
                new StudentData("AASANTH M", "23IT001", 48, 44, 27, 35, 35),
                new StudentData("AJAYPRABHAKAR S R", "23IT002", 39, 40, 12, 37, 32),
                new StudentData("AJAYPRASANNA P", "23IT003", 38, 36, 39, 26, 31),
                new StudentData("ARULMOZHI R", "23IT004", 47, 42, 44, 45, 42),
                new StudentData("ASHWINI M", "23IT005", 48, 43, 46, 44, 44),
                new StudentData("ATCHAYA M", "23IT006", 47, 44, 47, 45, 42),
                new StudentData("BALAJI M", "23IT007", 44, 41, 41, 43, 40),
                new StudentData("BARATH C", "23IT008", 0, 0, 7, 29, 35),
                new StudentData("DEEPAK P", "23IT009", 46, 41, 42, 45, 38),
                new StudentData("DEEPAK S", "23IT010", 44, 35, 0, 40, 36),
                new StudentData("DEEPIKASHREE G", "23IT011", 0, 0, 0, 0, 0),
                new StudentData("DEVA PRASATH R", "23IT012", 44, 44, 48, 48, 37),
                new StudentData("DHANALAKSHMI S", "23IT013", 48, 40, 46, 47, 36),
                new StudentData("DHANURDHAR T S", "23IT014", 45, 41, 37, 39, 42),
                new StudentData("DHANUSHKUMAR S", "23IT015", 48, 41, 43, 46, 43),
                new StudentData("DHATCHANAMOORTHY M S", "23IT016", 43, 35, 45, 42, 36),
                new StudentData("DHAVASRI P", "23IT017", 48, 44, 46, 46, 38),
                new StudentData("DHINESH M", "23IT018", 42, 35, 0, 26, 27),
                new StudentData("DHOSHITH P", "23IT019", 42, 43, 13, 30, 27),
                new StudentData("DIKSHA P", "23IT020", 48, 42, 46, 44, 41),
                new StudentData("DIVYA T", "23IT021", 41, 42, 46, 42, 40),
                new StudentData("DURGADEVI S", "23IT022", 48, 41, 48, 45, 39),
                new StudentData("GOKULNATH K", "23IT023", 44, 42, 40, 38, 39),
                new StudentData("GOWTHAM A", "23IT024", 43, 41, 42, 40, 34),
                new StudentData("GOWTHAM S", "23IT025", 0, 0, 34, 45, 31),
                new StudentData("GOWTHAMAN R", "23IT026", 43, 43, 46, 33, 36),
                new StudentData("HARISH R", "23IT027", 41, 44, 40, 39, 27),
                new StudentData("HARSHINI S", "23IT028", 48, 32, 47, 46, 28),
                new StudentData("HEMADHARSHINI J", "23IT029", 42, 42, 46, 42, 40),
                new StudentData("JAGANATHAN R", "23IT030", 45, 44, 40, 30, 25),
                new StudentData("JANANI M", "23IT031", 48, 45, 44, 47, 40),
                new StudentData("JEEVITHA D", "23IT032", 43, 42, 46, 43, 32),
                new StudentData("KALPANA C", "23IT033", 48, 44, 49, 42, 39),
                new StudentData("KANAGARAJAN M", "23IT034", 0, 0, 0, 0, 0),
                new StudentData("KANMANI E", "23IT035", 48, 43, 49, 44, 41),
                new StudentData("KARSHIN M", "23IT036", 47, 38, 46, 44, 41),
                new StudentData("KAVINKARTHIK V", "23IT037", 38, 35, 0, 11, 20),
                new StudentData("KAVIYA M", "23IT038", 40, 45, 45, 44, 34),
                new StudentData("KEERTHIKA M", "23IT039", 47, 46, 45, 47, 34),
                new StudentData("KISHORE K", "23IT040", 42, 42, 36, 39, 37),
                new StudentData("KISHORI D S", "23IT041", 48, 37, 48, 44, 38),
                new StudentData("KOWSALYA C", "23IT042", 47, 45, 48, 39, 42),
                new StudentData("KRISHNAVEL M", "23IT043", 42, 41, 0, 0, 0),
                new StudentData("LEKHA SRI K", "23IT044", 47, 44, 36, 47, 40),
                new StudentData("LITHIYASRI B S", "23IT045", 48, 44, 49, 48, 41),
                new StudentData("MAHALAKSHMI S", "23IT046", 48, 45, 48, 46, 41),
                new StudentData("MAHALAXMI S", "23IT047", 48, 39, 48, 44, 39),
                new StudentData("MAHENDRAN V", "23IT048", 40, 0, 37, 45, 35),
                new StudentData("MANISHA M", "23IT049", 47, 44, 46, 48, 42),
                new StudentData("MANOJ KUMAR S", "23IT050", 34, 45, 46, 48, 39),
                new StudentData("MEGAVARSINI S", "23IT051", 48, 44, 48, 48, 41),
                new StudentData("MEHENDHI J", "23IT052", 48, 43, 47, 46, 39),
                new StudentData("MEKHA M", "23IT053", 47, 45, 47, 46, 34),
                new StudentData("MIRUTHULA N", "23IT054", 47, 45, 0, 44, 31),
                new StudentData("MOHAN SANJAY S", "23IT055", 40, 40, 37, 38, 33),
                new StudentData("MONESH G", "23IT056", 42, 45, 45, 33, 37),
                new StudentData("MONIKA S", "23IT057", 47, 43, 43, 39, 38),
                new StudentData("MONISHA R", "23IT058", 45, 40, 45, 48, 43),
                new StudentData("MUKESHKANNA S", "23IT059", 0, 46, 41, 42, 28),
                new StudentData("NAGAVIKASH M", "23IT060", 44, 45, 44, 43, 37),
                new StudentData("NANDHA KUMAR R", "23IT061", 38, 12, 0, 0, 0),
                new StudentData("NAVEEN S", "23IT062", 48, 41, 47, 41, 37),
                new StudentData("NAVEENA S", "23IT063", 45, 39, 42, 25, 37),
                new StudentData("NIBISHA A", "23IT064", 44, 42, 43, 35, 42),
                new StudentData("PARTHIBAN S", "23IT065", 32, 28, 32, 30, 40),
                new StudentData("POOJA S P", "23IT066", 47, 44, 40, 41, 43),
                new StudentData("POOJASHREE V", "23IT067", 40, 32, 46, 45, 0),
                new StudentData("PRAKASH D", "23IT068", 0, 41, 38, 41, 36),
                new StudentData("PRANAV P", "23IT069", 36, 26, 40, 35, 35),
                new StudentData("PRIYA DHARSHAN M", "23IT071", 37, 26, 0, 0, 0),
                new StudentData("PRIYADHARSHINI K", "23IT072", 44, 43, 42, 43, 40),
                new StudentData("PUJA R N", "23IT073", 36, 0, 45, 38, 40),
                new StudentData("PUNNIYAMOORTHY K", "23IT074", 0, 0, 25, 12, 34),
                new StudentData("RAGULGANDHI S", "23IT075", 37, 43, 45, 35, 39),
                new StudentData("RAJKUMAR M", "23IT076", 38, 42, 45, 39, 41),
                new StudentData("RAJKUMAR V", "23IT077", 35, 42, 35, 33, 36),
                new StudentData("RAM PRAKASH K", "23IT078", 45, 42, 38, 32, 37),
                new StudentData("RANJITHKUMAR S", "23IT079", 0, 0, 0, 0, 0),
                new StudentData("REEGAN A", "23IT080", 35, 26, 26, 12, 29),
                new StudentData("SABARISH R", "23IT081", 0, 0, 0, 0, 0),
                new StudentData("SAI BRINTHA T", "23IT082", 44, 34, 45, 45, 42),
                new StudentData("SANJAY S U", "23IT083", 39, 41, 42, 25, 37),
                new StudentData("SANTHOSH R", "23IT084", 47, 42, 41, 37, 38),
                new StudentData("SANTHOSHINI V J", "23IT085", 45, 41, 43, 48, 42),
                new StudentData("SARATHI M", "23IT086", 43, 42, 41, 36, 37),
                new StudentData("SASIKUMAR K", "23IT087", 33, 35, 41, 29, 37),
                new StudentData("SASIREKHA M", "23IT088", 45, 45, 44, 47, 41),
                new StudentData("SATHIRIYAN S", "23IT089", 36, 38, 41, 19, 33),
                new StudentData("SELVA MUTHU MEENAKCHI M", "23IT090", 31, 31, 35, 32, 31),
                new StudentData("SESHA S", "23IT091", 44, 40, 42, 33, 28),
                new StudentData("SHARAN R", "23IT092", 35, 38, 44, 35, 32),
                new StudentData("SHARMILA P", "23IT093", 48, 39, 46, 45, 41),
                new StudentData("SHOBIKA K", "23IT094", 44, 45, 40, 46, 44),
                new StudentData("SHREE DHARSHIKA S", "23IT095", 48, 45, 49, 46, 43),
                new StudentData("SHRUTHI M", "23IT096", 42, 0, 41, 42, 35),
                new StudentData("SIVASAKTHI S", "23IT097", 46, 40, 48, 43, 41),
                new StudentData("SIVASAKTHIVEL P", "23IT098", 33, 39, 44, 26, 35),
                new StudentData("SNEHA D", "23IT099", 42, 41, 44, 43, 41),
                new StudentData("SOWBHARANYA R", "23IT100", 48, 42, 47, 46, 42),
                new StudentData("SRIDHAR K", "23IT101", 38, 19, 38, 33, 32),
                new StudentData("SRIKAR P", "23IT102", 41, 0, 35, 42, 0),
                new StudentData("SRISANTH G", "23IT103", 37, 34, 41, 36, 35),
                new StudentData("SRIVAISHNAVI M", "23IT104", 44, 45, 47, 47, 39),
                new StudentData("SUBASH H", "23IT105", 40, 39, 48, 42, 41),
                new StudentData("SUDHARSAN B", "23IT106", 40, 22, 43, 40, 43),
                new StudentData("SUSMITHA A", "23IT107", 48, 39, 49, 45, 43),
                new StudentData("SWETHA M", "23IT108", 41, 0, 43, 40, 35),
                new StudentData("TAMILARASAN S", "23IT109", 38, 43, 26, 31, 33),
                new StudentData("THANGABALU G", "23IT110", 34, 43, 26, 29, 35),
                new StudentData("THENDRAL T", "23IT111", 46, 43, 47, 43, 40),
                new StudentData("THIRUMALAI M", "23IT112", 45, 40, 25, 39, 38),
                new StudentData("UDAYA PRASANTH N", "23IT113", 39, 30, 43, 40, 42),
                new StudentData("VAISHNAVI S", "23IT114", 44, 37, 47, 47, 42),
                new StudentData("VARSHA S", "23IT115", 40, 37, 43, 40, 41),
                new StudentData("VINOTH B", "23IT117", 41, 34, 31, 33, 36),
                new StudentData("YOKESH P", "23IT118", 46, 41, 46, 36, 43),
                new StudentData("BALA HARISH S", "24IT501", 42, 34, 29, 36, 33),
                new StudentData("GOKULSURYA M", "24IT502", 37, 32, 36, 29, 35),
                new StudentData("KRISHNAN M", "24IT503", 0, 10, 25, 17, 31));

        for (StudentData sd : data) {
            // Check if user exists
            User user = userRepository.findByUsername(sd.rollNo).orElse(null);
            Student student;

            if (user == null) {
                // Create User
                user = new User();
                user.setUsername(sd.rollNo);
                user.setPassword(passwordEncoder.encode("password123"));
                user.setRole(Role.STUDENT);
                user.setRole(Role.STUDENT);
                // user = userRepository.save(user); // Removed to avoid detached entity error
                // with CascadeType.ALL

                // Create Student Profile
                student = new Student();
                student.setName(sd.name);
                student.setEmail(sd.rollNo + "@student.com"); // Fake email
                student.setUser(user);
                student.setYear("II"); // Assuming 2nd year logic based on 23IT prefix (currently 2026, 23 batch -> 3rd
                                       // year? Let's say II for now as placeholder)
                student.setDepartment("IT");
                student = studentRepository.save(student);
                System.out.println("Created student: " + sd.name);
            } else {
                student = studentRepository.findByUserId(user.getId()).orElse(null);
                if (student == null) {
                    // User exists but student profile missing (edge case)
                    student = new Student();
                    student.setName(sd.name);
                    student.setEmail(sd.rollNo + "@student.com");
                    student.setUser(user);
                    student = studentRepository.save(student);
                }
            }

            // Insert Marks
            saveMark(student, "Mobile Computing", sd.mc);
            saveMark(student, "Pcd", sd.pcd);
            saveMark(student, "Cloud Computing AWS", sd.ccAws);
            saveMark(student, "Web Technology", sd.wt);
            saveMark(student, "Docker", sd.dk);
        }
        System.out.println("Data Seeding Completed!");
    }

    private void saveMark(Student student, String subject, int marks) {
        Mark mark = markRepository.findByStudentIdAndSubjectAndExamType(student.getId(), subject, "Internal")
                .orElse(null);
        if (mark == null) {
            mark = new Mark();
            mark.setStudent(student);
            mark.setSubject(subject);
            mark.setExamType("Internal");
            mark.setMaxMarks(50);
        }
        mark.setMarksObtained(marks);
        markRepository.save(mark);
    }

    private void seedAnnouncements() {
        if (notificationRepository.count() > 0) {
            System.out.println("Notifications already seeded, skipping...");
            return;
        }

        Notification n1 = new Notification();
        n1.setTitle("Mid-Semester Examination Schedule Released");
        n1.setMessage(
                "The mid-semester examination schedule for all departments has been released. Please check the examination portal for your individual timetable. Students are advised to collect their hall tickets from the examination cell by Friday.\n\nImportant: Carry your ID card to every exam. No electronic devices allowed inside the examination hall.");
        n1.setCategory("EXAM");
        n1.setPriority("HIGH");
        n1.setRecipientRole("ALL");
        n1.setPostedBy("admin");
        n1.setType("MANUAL");
        n1.setActive(true);
        notificationRepository.save(n1);

        Notification n2 = new Notification();
        n2.setTitle("Annual Tech Fest 2026 - Registrations Open");
        n2.setMessage(
                "We are excited to announce that the Annual Tech Fest 'TechNova 2026' registrations are now open! This year we have exciting events including Hackathon, Coding Contest, Robotics Challenge, and Project Expo.\n\nEarly bird registration closes on March 1st. Register through the student portal.");
        n2.setCategory("EVENT");
        n2.setPriority("NORMAL");
        n2.setRecipientRole("STUDENT");
        n2.setPostedBy("staff");
        n2.setType("MANUAL");
        n2.setActive(true);
        notificationRepository.save(n2);

        Notification n3 = new Notification();
        n3.setTitle("Library Hours Extended During Exam Period");
        n3.setMessage(
                "The Central Library will extend its working hours during the examination period from 8:00 AM to 10:00 PM (Monday to Saturday). Digital library access will remain available 24/7.\n\nPlease maintain silence in the reading halls.");
        n3.setCategory("NOTICE");
        n3.setPriority("NORMAL");
        n3.setRecipientRole("ALL");
        n3.setPostedBy("admin");
        n3.setType("MANUAL");
        n3.setActive(true);
        notificationRepository.save(n3);

        Notification n4 = new Notification();
        n4.setTitle("⚠️ Campus Network Maintenance This Weekend");
        n4.setMessage(
                "The IT department will be performing scheduled maintenance on the campus network infrastructure this Saturday (Feb 22) from 10:00 PM to Sunday 6:00 AM.\n\nDuring this period, internet connectivity and campus portal access may be intermittent. Please plan your work accordingly.");
        n4.setCategory("URGENT");
        n4.setPriority("URGENT");
        n4.setRecipientRole("ALL");
        n4.setPostedBy("admin");
        n4.setType("MANUAL");
        n4.setActive(true);
        notificationRepository.save(n4);

        System.out.println("Announcements Seeded!");
    }

    public void cleanUpOrphanedStudents() {
        System.out.println("Starting cleanup of orphaned student accounts...");
        List<User> students = userRepository.findByRole(Role.STUDENT);
        int deletedCount = 0;

        for (User user : students) {
            boolean hasStudentProfile = studentRepository.findByUserId(user.getId()).isPresent();
            if (!hasStudentProfile) {
                System.out.println("Deleting orphaned user: " + user.getUsername());
                userRepository.delete(user);
                deletedCount++;
            }
        }
        System.out.println("Cleanup completed. Deleted " + deletedCount + " orphaned student accounts.");
    }

    public void deleteAllStudents() {
        System.out.println("Deleting ALL student data...");
        long userCountStart = userRepository.count();
        long studentCountStart = studentRepository.count();
        long markCountStart = markRepository.count();
        System.out.println("Counts before deletion - Users: " + userCountStart + ", Students: " + studentCountStart
                + ", Marks: " + markCountStart);

        // Delete dependent entities first (Marks, Assignments, Attendance, Leaves)
        markRepository.deleteAll();
        assignmentRepository.deleteAll();
        attendanceRepository.deleteAll();
        leaveRepository.deleteAll();

        // Delete all student profiles (which should cascade delete users if configured,
        // or we delete users manually)
        // Checking Student.java: @OneToOne(cascade = CascadeType.ALL) private User
        // user;
        // So deleting Student deletes User.
        studentRepository.deleteAll();

        // Also delete any users with ROLE_STUDENT that might not have a profile
        // (orphans)
        List<User> students = userRepository.findByRole(Role.STUDENT);
        userRepository.deleteAll(students);

        long userCountEnd = userRepository.count();
        long studentCountEnd = studentRepository.count();
        long markCountEnd = markRepository.count();
        System.out.println("All student data deleted.");
        System.out.println("Counts after deletion - Users: " + userCountEnd + ", Students: " + studentCountEnd
                + ", Marks: " + markCountEnd);
    }

    // Helper class
    static class StudentData {
        String name;
        String rollNo;
        int mc, pcd, ccAws, wt, dk;

        public StudentData(String name, String rollNo, int mc, int pcd, int ccAws, int wt, int dk) {
            this.name = name;
            this.rollNo = rollNo;
            this.mc = mc;
            this.pcd = pcd;
            this.ccAws = ccAws;
            this.wt = wt;
            this.dk = dk;
        }
    }
}
