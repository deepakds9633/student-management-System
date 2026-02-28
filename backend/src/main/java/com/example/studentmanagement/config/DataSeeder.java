package com.example.studentmanagement.config;

import com.example.studentmanagement.*;
import com.example.studentmanagement.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionTemplate;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Random;

@Component
public class DataSeeder implements CommandLineRunner {

        @Autowired
        private UserRepository userRepository;

        @Autowired
        private StudentRepository studentRepository;

        @Autowired
        private StaffRepository staffRepository;

        @Autowired
        private MarkRepository markRepository;

        @Autowired
        private NotificationRepository notificationRepository;

        @Autowired
        private AssignmentRepository assignmentRepository;

        @Autowired
        private AssignmentTaskRepository assignmentTaskRepository;

        @Autowired
        private AttendanceRepository attendanceRepository;

        @Autowired
        private LeaveRepository leaveRepository;

        @Autowired
        private EventRepository eventRepository;

        @Autowired
        private PasswordEncoder passwordEncoder;

        @Autowired
        private TransactionTemplate transactionTemplate;

        private final Random random = new Random();

        @Override
        public void run(String... args) throws Exception {
                if (userRepository.count() > 0) {
                        System.out.println(
                                        "✅ Database is already populated. Skipping DataSeeder execution to avoid constraint violations...");
                        return;
                }

                transactionTemplate.execute(status -> {
                        try {
                                // 1. Wipe ALL Existing Data (Absolute Zero-State)
                                clearDatabase();

                                // 2. Provision Core Infrastructure Accounts
                                createUser("admin", "admin", Role.ADMIN);
                                User staffUser = createUser("staff", "staff", Role.STAFF);
                                createStaff(staffUser, "Dr. Sarah Jenkins", "Information Technology");

                                // 3. Provision Default Student Testing Accounts
                                List<StudentData> studentList = getInitialStudentData();
                                for (StudentData data : studentList) {
                                        User u = createUser(data.rollNo, "password123", Role.STUDENT);
                                        Student s = createStudent(u, data.name, data.rollNo + "@eduverse.com",
                                                        data.phone, data.address);

                                        // 4. Seed Academic Records for High-Fidelity Validation
                                        seedMarks(s, data);
                                        seedAttendance(s);
                                        seedLeaves(s);
                                }

                                // 5. Seed Global Communications
                                seedNotifications();

                                // 6. Seed Curriculum Assets (Assignments)
                                seedAssignmentTasks();

                                System.out.println(
                                                "✅ Custom Data Integration Complete. 60 Students with precise marks and profiles seeded.");
                        } catch (Exception e) {
                                System.err.println("❌ Data Seeding Failure: " + e.getMessage());
                                e.printStackTrace();
                        }
                        return null;
                });
        }

        private void clearDatabase() {
                System.out.println("🧹 Purging legacy records...");
                notificationRepository.deleteAll();
                leaveRepository.deleteAll();
                attendanceRepository.deleteAll();
                assignmentRepository.deleteAll();
                assignmentTaskRepository.deleteAll();
                markRepository.deleteAll();
                eventRepository.deleteAll();
                studentRepository.deleteAll();
                staffRepository.deleteAll();
                userRepository.deleteAll();
        }

        private User createUser(String username, String password, Role role) {
                User user = new User();
                user.setUsername(username);
                user.setPassword(passwordEncoder.encode(password));
                user.setRole(role);
                return userRepository.save(user);
        }

        private void createStaff(User user, String name, String dept) {
                Staff staff = new Staff();
                staff.setUser(user);
                staff.setName(name);
                staff.setEmail(user.getUsername() + "@eduverse.com");
                staff.setDepartment(dept);
                staffRepository.save(staff);
        }

        private Student createStudent(User user, String name, String email, String phone, String address) {
                Student student = new Student();
                student.setUser(user);
                student.setName(name);
                student.setEmail(email);
                student.setPhoneNumber(phone);
                student.setAddress(address);
                student.setCourse("B.Tech IT");
                student.setYear("III");
                student.setSemester("VI");
                student.setDepartment("Information Technology");
                return studentRepository.save(student);
        }

        private void seedMarks(Student student, StudentData data) {
                saveMark(student, "Mobile Computing", data.mc);
                saveMark(student, "PCD", data.pcd);
                saveMark(student, "Cloud Computing AWS", data.ccAws);
                saveMark(student, "Web Technology", data.wt);
                saveMark(student, "Docker & K8s", data.dk);
        }

        private void saveMark(Student student, String subject, String value) {
                Mark m = new Mark();
                m.setStudent(student);
                m.setSubject(subject);
                m.setExamType("Internal-I");
                m.setMaxMarks(50);

                if ("AB".equalsIgnoreCase(value)) {
                        m.setMarksObtained(null);
                } else {
                        try {
                                m.setMarksObtained(Integer.parseInt(value));
                        } catch (NumberFormatException e) {
                                m.setMarksObtained(0);
                        }
                }
                markRepository.save(m);
        }

        private void seedAttendance(Student student) {
                LocalDate start = LocalDate.now().minusDays(14);
                for (int i = 0; i < 14; i++) {
                        Attendance a = new Attendance();
                        a.setStudent(student);
                        a.setDate(start.plusDays(i));
                        a.setStatus(random.nextInt(10) > 1 ? "Present" : "Absent");
                        attendanceRepository.save(a);
                }
        }

        private void seedLeaves(Student student) {
                if (student.getUser().getUsername().equals("23IT001")) {
                        Leave l = new Leave();
                        l.setStudent(student);
                        l.setStartDate(LocalDate.now().plusDays(2));
                        l.setEndDate(LocalDate.now().plusDays(3));
                        l.setReason("Participation in National Level Hackathon - Smart India Hackathon 2026");
                        l.setStatus("APPROVED");
                        l.setRemarks("Academic excellence recognized. Leave authorized.");
                        leaveRepository.save(l);
                }
        }

        private void seedNotifications() {
                Notification n1 = new Notification();
                n1.setTitle("⚠️ Infrastructure Alert: Network Maintenance");
                n1.setMessage(
                                "The Institutional Data Center will undergo critical fiber-optic upgrades this Sunday from 02:00 to 06:00 IST. Connectivity will be intermittent.");
                n1.setCategory("URGENT");
                n1.setPriority("URGENT");
                n1.setRecipientRole("ALL");
                n1.setPostedBy("admin");
                n1.setType("SYSTEM");
                notificationRepository.save(n1);

                Notification n2 = new Notification();
                n2.setTitle("📅 Academic Calendar: Term-End Examination");
                n2.setMessage(
                                "The comprehensive evaluation schedule for Spring 2026 has been finalized. Hall tickets will be provisioned via the secure vault from next Monday.");
                n2.setCategory("EXAM");
                n2.setPriority("HIGH");
                n2.setRecipientRole("STUDENT");
                n2.setPostedBy("staff");
                n2.setType("MANUAL");
                notificationRepository.save(n2);
        }

        private void seedAssignmentTasks() {
                AssignmentTask t = new AssignmentTask();
                t.setTitle("Containerization of Microservices");
                t.setDescription(
                                "Design a multi-stage Dockerfile for a React-Spring Boot application. Ensure image optimization and secure protocol handling.");
                t.setSubject("Docker & K8s");
                t.setDeadline(LocalDateTime.now().plusDays(7));
                assignmentTaskRepository.save(t);
        }

        private List<StudentData> getInitialStudentData() {
                return Arrays.asList(
                                new StudentData("AASANTH M", "23IT001", "48", "44", "27", "35", "35", "6374106124",
                                                "5/145 Maruthaiyan Kovil Street, Goodamalai (PO), Gangavalli (TK)"),
                                new StudentData("AJAYPRABHAKAR S R", "23IT002", "39", "40", "12", "37", "32",
                                                "8220309258",
                                                "7/8A, West Street, Singalandapuram (PO), Rasipuram (TK)"),
                                new StudentData("AJAYPRASANNA P", "23IT003", "38", "36", "39", "26", "31", "9943477485",
                                                "163/40, Krishnan Kovil Street, Ammapet"),
                                new StudentData("ARULMOZHI R", "23IT004", "47", "42", "44", "45", "42", "9345377977",
                                                "2/142, Kosavampalayam, Ramapuram (PO), Tiruchengode (TK)"),
                                new StudentData("ASHWINI M", "23IT005", "48", "43", "46", "44", "44", "9688000782",
                                                "2/276, Kittampatti, Jittandhalli (PO), Palacode (TK)"),
                                new StudentData("ATCHAYA M", "23IT006", "47", "44", "47", "45", "42", "7540052219",
                                                "Anbu Nagar, Valakombai Cross Road, Thammapatti (PO), Gangavalli (TK)"),
                                new StudentData("BALAJI M", "23IT007", "44", "41", "41", "43", "40", "6382317348",
                                                "75/12 A, Grain Bazaar, Pudupet (PO), Attur (TK)"),
                                new StudentData("BARATH C", "23IT008", "AB", "AB", "7", "29", "35", "6381209825",
                                                "23/11, Periya Kinaru Street, Ammapet"),
                                new StudentData("DEEPAK P", "23IT009", "46", "41", "42", "45", "38", "9677628533",
                                                "7/48-C, Millukkadu, Vadugapatti, Oruvandur (PO), Mohanur (TK)"),
                                new StudentData("DEEPAK S", "23IT010", "44", "35", "AB", "40", "36", "8838714004",
                                                "1/138, Periyahambikottai, Anakode (PO), Pochampalli (TK)"),
                                new StudentData("DEEPIKASHREE G", "23IT011", "AB", "AB", "AB", "AB", "AB", "9345730277",
                                                "6/4, Ollaipatti, O. Sowdhapuram (PO), Rasipuram (TK)"),
                                new StudentData("DEVA PRASATH R", "23IT012", "44", "44", "48", "48", "37", "9500397728",
                                                "5/175 A, Pannaiyathar Kadu, Valaiyamadevi (PO), Attur (TK)"),
                                new StudentData("DHANALAKSHMI S", "23IT013", "48", "40", "46", "47", "36", "6369247269",
                                                "4/57, Avarangam Palayam, Kottavarathampatti, Mavelipalayam (PO), Sankari (TK)"),
                                new StudentData("DHANURDHAR T S", "23IT014", "45", "41", "37", "39", "42", "9787190686",
                                                "4/42, Yerikadu, Kallanatham (PO), Attur (TK)"),
                                new StudentData("DHANUSHKUMAR S", "23IT015", "48", "41", "43", "46", "43", "9787190686",
                                                "2/320, Kongarapatti (PO), Karimangalam (TK)"),
                                new StudentData("DHATCHANAMOORTHY M S", "23IT016", "43", "35", "45", "42", "36",
                                                "9360980815",
                                                "171/A, Athanurpatty (PO), Valappady (TK)"),
                                new StudentData("DHAVASRI P", "23IT017", "48", "44", "46", "46", "38", "9345813730",
                                                "3/600, 10 Acre Colony, Ramanaickenpalayam (PO), Attur (TK)"),
                                new StudentData("DHINESH M", "23IT018", "42", "35", "AB", "26", "27", "7845644603",
                                                "1/182, Vadakku Kadukottai, Varagur (PO), Attur (TK)"),
                                new StudentData("DHOSHITH P", "23IT019", "42", "43", "13", "30", "27", "7339313672",
                                                "63-12, Nallappanaickan Street, Sankari (PO), Sankari (TK)"),
                                new StudentData("DIKSHA P", "23IT020", "48", "42", "46", "44", "41", "9360282403",
                                                "7/71, North Street, T. Vengidapuram, Chinnadharapuram (PO), Aravakurichi (TK)"),
                                new StudentData("DIVYA T", "23IT021", "41", "42", "46", "42", "40", "9384740983",
                                                "341/7, Tholar Kudikkadu, Choodalore (PO), Thittakudi (TK)"),
                                new StudentData("DURGADEVI S", "23IT022", "48", "41", "48", "45", "39", "9345759154",
                                                "3/60, Soundaranayakipuram, Amaradakki (PO), Avudaiyarkovil (TK)"),
                                new StudentData("GOKULNATH K", "23IT023", "44", "42", "40", "38", "39", "6383797754",
                                                "5/118, Selliyampalayam, Minnampalli (PO), Vazhappady (TK)"),
                                new StudentData("GOWTHAM A", "23IT024", "43", "41", "42", "40", "34", "9159086903",
                                                "8/A10, Rasinagar, Kurukkapuram (PO), Rasipuram (TK)"),
                                new StudentData("GOWTHAM S", "23IT025", "AB", "AB", "34", "45", "31", "6380173372",
                                                "6/830, EB Colony, Paramathi Road, Periyappaty (PO), Namakkal (TK)"),
                                new StudentData("GOWTHAMAN R", "23IT026", "43", "43", "46", "33", "36", "9688925060",
                                                "6/43-1, Thottakurpatty, Navani, Puduchatram (PO), Namakkal (TK)"),
                                new StudentData("HARISH R", "23IT027", "41", "44", "40", "39", "27", "9688925060",
                                                "3/228, Selliyampalayam, Narasingapuram (PO), Attur (TK)"),
                                new StudentData("HARSHINI S", "23IT028", "48", "32", "47", "46", "28", "9087407318",
                                                "221/A1/W-3, Sithivinayagar Nagar, Pulikuthi, Pannaipuram (PO), Uthamapalayam (TK)"),
                                new StudentData("HEMADHARSHINI J", "23IT029", "42", "42", "46", "42", "40",
                                                "6379318077",
                                                "114, Pandurangan Kovil Street Extension, Karungalpatti, Gugai (PO), Salem (TK)"),
                                new StudentData("JAGANATHAN R", "23IT030", "45", "44", "40", "30", "25", "9342010414",
                                                "828, Arundhathiyar Street, Perungolathur (PO), Thandrampet (TK)"),
                                new StudentData("JANANI M", "23IT031", "48", "45", "44", "47", "40", "7812866855",
                                                "7/175, Palakkadu Vinayagapuram, Athanur (PO), Rasipuram (TK)"),
                                new StudentData("JEEVITHA D", "23IT032", "43", "42", "46", "43", "32", "9360917166",
                                                "3/61, Kalliyan Valasu, Ammapalayam, Mukkuthipalayam (PO), Salem (TK)"),
                                new StudentData("KALPANA C", "23IT033", "48", "44", "49", "42", "39", "9791453573",
                                                "36, Pettai Street, Yethapur (PO), Attur (TK)"),
                                new StudentData("KANAGARAJAN M", "23IT034", "AB", "AB", "AB", "AB", "AB", "8825677641",
                                                "2/12, Maragoundan Pudur, Kattuvalavu, Pannapatti (PO), Kadaiyampatti (TK)"),
                                new StudentData("KANMANI E", "23IT035", "48", "43", "49", "44", "41", "6374984110",
                                                "2/52, Mariyamman Kovil Street, Chockanathapuram (PO), Attur (TK)"),
                                new StudentData("KARSHIN M", "23IT036", "47", "38", "46", "44", "41", "9976619293",
                                                "175, Periyakadu, Karuvalli (PO), Kadayampatti (TK)"),
                                new StudentData("KAVINKARTHIK V", "23IT037", "38", "35", "AB", "11", "20", "9655320944",
                                                "77, Singarapettai Paithur Road, Puthupettai (PO), Attur (TK)"),
                                new StudentData("KAVIYA M", "23IT038", "40", "45", "45", "44", "34", "9751862246",
                                                "35/74, Veppampatty, Veppampatty Pudhur (PO), Namakkal (TK)"),
                                new StudentData("KEERTHIKA M", "23IT039", "47", "46", "45", "47", "34", "9384386802",
                                                "2/166, Kattur, Morangam (PO), Tiruchengode (TK)"),
                                new StudentData("KISHORE K", "23IT040", "42", "42", "36", "39", "37", "9042028400",
                                                "3/407, Ammasi Thootam, T. Murangapatti (PO), Thuraiyur (TK)"),
                                new StudentData("KISHORI D S", "23IT041", "48", "37", "48", "44", "38", "8072791750",
                                                "7/237, Rangaswamy Thottam, Vasanthapuram, M.V. Colony (PO), Thalaivasal (TK)"),
                                new StudentData("KOWSALYA C", "23IT042", "47", "45", "48", "39", "42", "9489331484",
                                                "1/134, Poosalikotti, Padi (PO), Palacode (TK)"),
                                new StudentData("KRISHNAVEL M", "23IT043", "42", "41", "AB", "AB", "AB", "9498364859",
                                                "1/7, Poosaripatti Gate, Poosaripatti (PO), Kadayampatti (TK)"),
                                new StudentData("LEKHA SRI K", "23IT044", "47", "44", "36", "47", "40", "9345194565",
                                                "13/53, Kaliamman Kovil Street, S. Nattamangalam, Kondalampatti"),
                                new StudentData("LITHIYASRI B S", "23IT045", "48", "44", "49", "48", "41", "8608461280",
                                                "4/32-1, Senguttaikadu, Palaniappanur (PO), Rasipuram (TK)"),
                                new StudentData("MAHALAKSHMI S", "23IT046", "48", "45", "48", "46", "41", "8122038810",
                                                "13/6A, Vandimettu Street, Chinnasalem (PO), Chinnasalem (TK)"),
                                new StudentData("MAHALAXMI S", "23IT047", "48", "39", "48", "44", "39", "7418862579",
                                                "9, Perumal Kovil Street, Belur Karadipatti, Kottavadi (PO), P.N. Palayam (TK)"),
                                new StudentData("MAHENDRAN V", "23IT048", "40", "AB", "37", "45", "35", "6380179568",
                                                "2/71, Poonjolaikaadu, Masakalipatty (PO), Rasipuram (TK)"),
                                new StudentData("MANISHA M", "23IT049", "47", "44", "46", "48", "42", "9360634813",
                                                "4/52, Ninganangaradu Kattukottai, Vanikinaru, Pudupatti (PO), Rasipuram (TK)"),
                                new StudentData("MANOJ KUMAR S", "23IT050", "34", "45", "46", "48", "39", "6374695513",
                                                "22/2, Kathalapettai Street, Namagiripettai (PO), Rasipuram (TK)"),
                                new StudentData("MEGAVARSINI S", "23IT051", "48", "44", "48", "48", "41", "8807158145",
                                                "2/28, Dhandukaranahalli (PO), Palacode (TK)"),
                                new StudentData("MEHENDHI J", "23IT052", "48", "43", "47", "46", "39", "8754866393",
                                                "7/18, Vanakaranpudur, Thathayangarpatty (PO), Namakkal (TK)"),
                                new StudentData("MEKHA M", "23IT053", "47", "45", "47", "46", "34", "9043310630",
                                                "14/54, Jawahar Mill, South Pallapatti, Salem (PO), West Salem (TK)"),
                                new StudentData("MIRUTHULA N", "23IT054", "47", "45", "AB", "44", "31", "9655039330",
                                                "3/246, Anna Nagar, Attayampatty, Veerapandi (PO), Salem (TK)"),
                                new StudentData("MOHAN SANJAY S", "23IT055", "40", "40", "37", "38", "33", "9344577584",
                                                "2/162, Reddiyar Street, Siluvampatti (PO), Namakkal (TK)"),
                                new StudentData("MONESH G", "23IT056", "42", "45", "45", "33", "37", "9345699159",
                                                "5/19, Kanjanaickanur, Kannurpatti (PO), Namakkal (TK)"),
                                new StudentData("MONIKA S", "23IT057", "47", "43", "43", "39", "38", "7845394380",
                                                "2/73-1, East Street, Palaniyappanur (PO), Rasipuram (TK)"),
                                new StudentData("MONISHA R", "23IT058", "45", "40", "45", "48", "43", "7904238338",
                                                "3/37A, Devasthanam Pudhur, Namagiripettai (PO), Rasipuram (TK)"),
                                new StudentData("MUKESHKANNA S", "23IT059", "AB", "46", "41", "42", "28", "6381818393",
                                                "2/150 A, Pachapalikadu, Kadachanallur (PO), Kumarapalayam (TK)"),
                                new StudentData("NAGAVIKASH M", "23IT060", "44", "45", "44", "43", "37", "8838600846",
                                                "8th Ward, Vinayaga Street, Keeripatty (PO), Attur (TK)"));
        }

        static class StudentData {
                String name, rollNo, phone, address;
                String mc, pcd, ccAws, wt, dk;

                public StudentData(String name, String rollNo, String mc, String pcd, String ccAws, String wt,
                                String dk,
                                String phone, String address) {
                        this.name = name;
                        this.rollNo = rollNo;
                        this.mc = mc;
                        this.pcd = pcd;
                        this.ccAws = ccAws;
                        this.wt = wt;
                        this.dk = dk;
                        this.phone = phone;
                        this.address = address;
                }
        }
}
