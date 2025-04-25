import express from 'express';
import path from 'path';
import { supabase } from './lib/supabase';
import Handlebars from 'handlebars';
import fs from 'fs';

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Media Kit route
app.get('/api/media-kit/:username', async (req, res) => {
  try {
    const { username } = req.params;
    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }

    // Get profile data from Supabase
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', username)
      .single();

    if (error) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Read the media kit template
    const templatePath = path.join(process.cwd(), 'public', 'media.html');
    const template = fs.readFileSync(templatePath, 'utf-8');

    // Compile and render the template with profile data
    const compiledTemplate = Handlebars.compile(template);
    const html = compiledTemplate({ profile });

    // Set content type and send response
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (error) {
    console.error('Error rendering media kit:', error);
    res.status(500).json({ error: 'Failed to render media kit' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
}); 