// In ReportsPage component, add useEffect to load reports
useEffect(() => {
  const loadReports = async () => {
    try {
      const response = await api.getReports({ search: searchTerm });
      if (response.success) {
        setReports(response.data.reports);
      }
    } catch (error) {
      console.error('Failed to load reports:', error);
    }
  };

  loadReports();
}, [searchTerm]);