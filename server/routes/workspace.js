const router = require('express').Router();
const auth = require('../middlewares/auth');
const Workspace = require('../models/Workspace');

// Create workspace
router.post('/create', auth, async (req, res) => {
  try {
    const { name } = req.body;
    const workspace = await Workspace.create({
      name,
      ownerId: req.userId,
      members: [req.userId]
    });
    res.json({ success: true, workspace });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all my workspaces
router.get('/my-workspaces', auth, async (req, res) => {
  try {
    const workspaces = await Workspace.find({
      $or: [
        { ownerId: req.userId },
        { members: req.userId }
      ]
    });
    res.json({ success: true, workspaces });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single workspace
router.get('/:workspaceId', auth, async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.workspaceId);
    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found' });
    }
    
    const hasAccess = workspace.ownerId.toString() === req.userId || 
                      workspace.members.includes(req.userId);
    
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    res.json({ success: true, workspace });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add member to workspace
router.post('/:workspaceId/add-member', auth, async (req, res) => {
  try {
    const { memberId } = req.body;
    const workspace = await Workspace.findById(req.params.workspaceId);
    
    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found' });
    }
    
    if (workspace.ownerId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Only owner can add members' });
    }
    
    if (!workspace.members.includes(memberId)) {
      workspace.members.push(memberId);
      await workspace.save();
    }
    
    res.json({ success: true, workspace });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;