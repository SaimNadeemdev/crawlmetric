import { Box, Typography, Card, CardContent } from "@mui/material"

const Dashboard = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      {/* Overview Section */}
      <Card>
        <CardContent>
          <Typography variant="h6" component="div">
            Overview
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This is a general overview of the system.
          </Typography>
        </CardContent>
      </Card>

      {/* Other Dashboard Sections can be added here */}
      <Card>
        <CardContent>
          <Typography variant="h6" component="div">
            Another Section
          </Typography>
          <Typography variant="body2" color="text.secondary">
            More information can be displayed here.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  )
}

export default Dashboard

