#!/bin/bash
# Remove everything from "/* Responsive FullCalendar Toolbar */" to the end
sed -i '/\/\* Responsive FullCalendar Toolbar \*\//,$d' src/index.css

cat << 'INNER_EOF' >> src/index.css
/* Responsive FullCalendar Toolbar */
@media (max-width: 640px) {
  .fc .fc-toolbar.fc-header-toolbar {
    display: flex !important;
    flex-direction: column !important;
    gap: 0.5rem !important;
    margin-bottom: 0.75rem !important;
  }
  .fc .fc-toolbar-chunk {
    display: flex !important;
    justify-content: center !important;
    width: 100% !important;
  }
  .fc .fc-toolbar-title {
    font-size: 1rem !important;
    text-align: center;
  }
  .fc .fc-button-group {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 4px;
  }
  .fc .fc-button {
    padding: 0.35rem 0.6rem !important;
    font-size: 0.75rem !important;
  }
}
INNER_EOF
