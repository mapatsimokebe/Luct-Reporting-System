const ExcelJS = require('exceljs');

const generateExcelReport = async (reports) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Lecture Reports');

  // Add headers
  worksheet.columns = [
    { header: 'Week', key: 'week', width: 10 },
    { header: 'Date', key: 'date', width: 15 },
    { header: 'Faculty', key: 'faculty', width: 20 },
    { header: 'Class', key: 'class', width: 15 },
    { header: 'Course Code', key: 'course_code', width: 15 },
    { header: 'Course Name', key: 'course_name', width: 25 },
    { header: 'Lecturer', key: 'lecturer', width: 20 },
    { header: 'Students Present', key: 'students_present', width: 15 },
    { header: 'Total Students', key: 'total_students', width: 15 },
    { header: 'Topic', key: 'topic', width: 30 },
    { header: 'Status', key: 'status', width: 12 }
  ];

  // Style headers
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE6E6FA' }
  };

  // Add data
  reports.forEach(report => {
    worksheet.addRow({
      week: report.week_of_reporting,
      date: report.date_of_lecture,
      faculty: report.faculty_name,
      class: report.class_name,
      course_code: report.course_code,
      course_name: report.course_name,
      lecturer: report.lecturer_name,
      students_present: report.actual_students_present,
      total_students: report.total_registered_students,
      topic: report.topic_taught,
      status: report.status
    });
  });

  return workbook;
};

module.exports = { generateExcelReport };