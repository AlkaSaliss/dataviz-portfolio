import React from 'react'
import clsx from 'clsx'
import { makeStyles } from '@material-ui/core/styles'
import Drawer from '@material-ui/core/Drawer'
import CssBaseline from '@material-ui/core/CssBaseline'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import List from '@material-ui/core/List'
import Typography from '@material-ui/core/Typography'
import Divider from '@material-ui/core/Divider'
import IconButton from '@material-ui/core/IconButton'
import MenuIcon from '@material-ui/icons/Menu'
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft'
import ScatterIcon from '@material-ui/icons/ScatterPlot'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import VisibilityIcon from '@material-ui/icons/Visibility'
import TranslateIcon from '@material-ui/icons/Translate'
import ListItemText from '@material-ui/core/ListItemText'
import HomePage from './HomePage'
import Resume from './resume/Resume'
import VisionPage from './vision/VisionPage'
import ScatterPlotPage from './scatterPlots/ScatterPlotPage'


const drawerWidth = 240

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  appBar: {
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: drawerWidth,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  hide: {
    display: 'none',
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
  },
  drawerHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
    justifyContent: 'flex-end',
  },
  content: {
    flexGrow: 1,
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: -drawerWidth,
  },
  contentShift: {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  },
  menuIcons: {
    fontSize: '2em',
    color: '#19e9e9'
  }
}))

export default () => {
  const classes = useStyles()
  const [open, setOpen] = React.useState(false)
  const [activeMenu, setActiveMenu] = React.useState('home')

  const handleDrawerOpen = () => setOpen(true)

  const handleDrawerClose = () => setOpen(false)

  const handleMenuChange = (menu) => {
    if (activeMenu === menu) return
    setActiveMenu(menu)
  }


  const toggleMenu = () => {
    if (activeMenu === 'home') {
      return (<HomePage />)
    } else if (activeMenu === "resume") {
      return (<Resume />)
    } else if (activeMenu === 'scatter') {
      return (<ScatterPlotPage />)
    } else if (activeMenu === 'cv') {
      return (<VisionPage />)
    }
  }


  return (
    <div className={classes.root}>
      <CssBaseline />
      <AppBar
        position="fixed"
        className={clsx(classes.appBar, {
          [classes.appBarShift]: open,
        })}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            className={clsx(classes.menuButton, open && classes.hide)}
          >
            <MenuIcon />
          </IconButton>

          <div className='home-title' style={{ display: 'flex', cursor: 'pointer' }} onClick={() => handleMenuChange('home')}>
            <i className="fa fa-terminal" aria-hidden='true'
              style={{
                fontSize: '1.25em', color: 'fffefb',
                background: 'black', marginTop: '4px', marginBottom: '4px'
              }} >
            </i>
            <Typography variant="h4" noWrap>
              Home
            </Typography>
            <i className="fa fa-code" aria-hidden='true' style={{ fontSize: '1.5em', color: '#19e9e9', marginTop: '8px' }} ></i>
          </div>
        </Toolbar>
      </AppBar>


      <Drawer
        className={classes.drawer}
        variant="persistent"
        anchor="left"
        open={open}
        classes={{
          paper: classes.drawerPaper,
        }}
      >
        <div className={classes.drawerHeader}>
          <IconButton onClick={handleDrawerClose} >
            <ChevronLeftIcon />
          </IconButton>
        </div>
        <Divider />
        <List>
          <ListItem button key={0} className='menu-icons' onClick={() => handleMenuChange('resume')}>
            <ListItemIcon >
              <i className={`fa fa-graduation-cap ${classes.menuIcons}`} aria-hidden='true'  ></i>
            </ListItemIcon>
            <ListItemText primary="Resume" color='black' />
          </ListItem>
          <Divider/>
          <ListItem button key={1} className='menu-icons' onClick={() => handleMenuChange('scatter')}>
            <ListItemIcon >
              <ScatterIcon className={`${classes.menuIcons}`} />
            </ListItemIcon>
            <ListItemText primary="DataViz Show" color='black' />
          </ListItem>
          <Divider />
          <ListItem button key={2} className='menu-icons' onClick={() => handleMenuChange('cv')}>
            <ListItemIcon >
              <VisibilityIcon className={`${classes.menuIcons}`} />
            </ListItemIcon>
            <ListItemText primary="Computer Vision" color='black' />
          </ListItem>
          <Divider />
          <ListItem button key={3} className='menu-icons' onClick={() => handleMenuChange('nlp')}>
            <ListItemIcon >
              <TranslateIcon className={`${classes.menuIcons}`}/>
            </ListItemIcon>
            <ListItemText primary="NLP" color='black' />
          </ListItem>
          <Divider />
        </List>
      </Drawer>
      <main
        className={clsx(classes.content, {
          [classes.contentShift]: open,
        })}
      >
        <div className={classes.drawerHeader} />
        {toggleMenu()}
      </main>
    </div >
  )
}