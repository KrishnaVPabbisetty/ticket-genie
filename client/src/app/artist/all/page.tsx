"use client";

import * as React from "react";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Fade from "@mui/material/Fade";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import SendIcon from "@mui/icons-material/Send";
import TextField from "@mui/material/TextField";
import dayjs from 'dayjs'; // Ensure you have dayjs imported
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import Chip from "@mui/material/Chip";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { styled } from "@mui/material/styles";
import { Container, Grid } from "@mui/material";
import { getDataFromEndPoint } from "@/src/lib/backend-api";
import theme from "@/src/app/styles/theme";
import { useState, useEffect } from "react";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useRouter } from 'next/navigation'; // Import the useRouter hook
import useStore from '@/src/store';


const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

// Crew data array
const crew_names = [
  "Director",
  "Producer",
  "Music Director",
  "Screenwriter",
  "Cinematographer",
  "Editor",
  "Art Director",
];

const cast_names = ["Actor", "Actress", "Other Actors"];

// Constants for menu properties
const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

// Styled component for visually hidden input
const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  whiteSpace: "nowrap",
  width: 1,
});

// Function to get styles for select items
function getStyles(
  name: any,
  personName: string | any[],
  theme: { typography: { fontWeightRegular: any; fontWeightMedium: any } }
) {
  return {
    fontWeight:
      personName.indexOf(name) === -1
        ? theme.typography.fontWeightRegular
        : theme.typography.fontWeightMedium,
  };
}

interface CastAndCrewMember {
  id: any;
  name: string;
  profession: string;
  profile_url: string;
  artist_id: string;
  about: string;
}

export default function Contact() {
  const [cast, setCast] = useState<any>([]);
  const [crew, setCrew] = useState<any>([]);
  const [formSuccess, setFormSuccess] = useState(false);
  const [formSuccessMessage, setFormSuccessMessage] = useState("");
  const [open, setOpen] = useState(false);
  const store: any = useStore();
  const isAdmin = store.isAdmin; // Replace with the actual way to get this info
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageUrl, setImageUrl] = useState('/broken-image.jpg');
  const [enableEdit, setEnableEdit] = useState<boolean>(false);
  const [editData, setEditData] = useState<any>({});
  const handleOpen = () => setOpen(true);


  const handleClose = () => {
    setOpen(false);
    if (enableEdit) {
      setEnableEdit(false);
      setImageUrl('/broken-image.jpg');
      setEditData({});
    }
  }

  const router = useRouter();

  const [formData, setFormData] = useState<any>({
    fullname: "",
    dateOfBirth: "",
    gender: "",
    category: "",
    profession: [],
    about: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // const response = await fetch("http://localhost:8080/artist/all");
        const response = await getDataFromEndPoint("", `artist/all`, "GET");
        // if (!response.ok) {
        //   throw new Error(`Error: ${response.status}`);
        // }
        // const data = await response.json();
        setCast(response.Cast);
        setCrew(response.Crew);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };

    fetchData();
  }, []);


  const handleArtistClick = (artist_id: any) => {
    router.push(`/artist/${artist_id}`);
  }

  const handleFileChange = (e: any) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setSelectedFile(file);
    }
  };

  const submitForm = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    const data = new FormData();
    if (selectedFile) {
      data.append("image", selectedFile);
    }
    Object.entries(formData).forEach(([key, value]) => {
      if (key === "profession") {
        data.append(key, (value as string[]).join(", "));
      } else {
        data.append(key, value as string | Blob);
      }
    });

    if (!enableEdit) {
      const formURL = "artist/add";
      const response = await getDataFromEndPoint(data, formURL, "POST");
      if (response.status === 200) {
        if (formData.category === "Crew") {
          setCrew([...crew, response.artist]);
        } else if (formData.category === "Cast") {
          setCast([...cast, response.artist]);
        }
      }
    }
    else {
      const formURL = "artist/updateArtist";
      data.append('id', editData.id);
      const response = await getDataFromEndPoint(data, formURL, "POST");
      if (response != null) {
        // const response = await fetch("http://localhost:8080/artist/all");
        const response = await getDataFromEndPoint("", `artist/all`, "GET");
        // if (!response.ok) {
        //   throw new Error(`Error: ${response.status}`);
        // }
        // const data = await response.json();
        setCast(response.Cast);
        setCrew(response.Crew);
      }
    }
    handleClose();
  };

  const handleInput = (e: { target: { name: any; value: any } }) => {
    const { name, value } = e.target;
    setFormData((prevState: any) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const deleteArtist = async (artist: any) => {
    const formURL = "artist/deleteArtist";
    const data = { "id": artist.id };
    const response = await getDataFromEndPoint(data, formURL, "POST");
    if (response != null) {
      // const response = await fetch("http://localhost:8080/artist/all");
      const response = await getDataFromEndPoint("", 'artist/all', "GET");
      // if (!response.ok) {
      //   throw new Error(`Error: ${response.status}`);
      // }
      // const data = await response.json();
      setCast(response.Cast);
      setCrew(response.Crew);
    }
  }

  const editCast = async (cast: any) => {
    setEnableEdit(true);
    try {
      // const response = await fetch(`http://localhost:8080/artist/${cast.id}`);
      const data = await getDataFromEndPoint("", `artist/${cast.id}`, "GET")
      // if (!response.ok) {
      //   throw new Error(`Error: ${response.status}`);
      // }
      // const data = await response.json();
      setEditData(data.artist);
      setFormData(() => ({
        fullname: data.artist.name,
        dateOfBirth: dayjs(data.artist.dob),
        gender: data.artist.gender,
        category: "Cast",
        profession: [data.artist.profession],
        about: data.artist.description,
      }));
      setImageUrl(data.artist.profile_url);
      setOpen(true);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
  }

  const editCrew = async (crew: any) => {
    setEnableEdit(true);
    try {
      // const response = await fetch(`http://localhost:8080/artist/${crew.id}`);
      const data = await getDataFromEndPoint("", `artist/${crew.id}`, "GET");
      // if (!response.ok) {
      //   throw new Error(`Error: ${response.status}`);
      // }
      // const data = await response.json();
      setEditData(data.artist);
      setFormData(() => ({
        fullname: data.artist.name,
        dateOfBirth: dayjs(data.artist.dob),
        gender: data.artist.gender,
        category: "Crew",
        profession: [data.artist.profession],
        about: data.artist.description,
      }));
      setImageUrl(data.artist.profile_url);
      setOpen(true);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
  }

  return (
    <div>
      {isAdmin &&
        <Button
          sx={{ paddingTop: 2, paddingRight: 0, fontWeight: "bold" }}
          onClick={handleOpen}
        >
          Add Artist
        </Button>
      }
      <Modal
        open={open}
        onClose={handleClose}
        closeAfterTransition
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
      >
        <Fade in={open}>
          <Box sx={style}>
            <form
              onSubmit={submitForm}
              encType="multipart/form-data"
            // action="/artist/add"
            >
              <Stack direction="column" spacing={2}>
                <Box sx={{ display: "flex", justifyContent: "center" }}>
                  <Avatar
                    sx={{ width: 100, height: 100 }}
                    src={
                      selectedFile
                        ? URL.createObjectURL(selectedFile)
                        : imageUrl
                    }
                  />
                </Box>
                <Box sx={{ display: "flex", justifyContent: "center" }}>
                  <Button
                    sx={{ width: 200 }}
                    component="label"
                    variant="contained"
                    startIcon={<CloudUploadIcon />}
                  >
                    Upload file
                    <VisuallyHiddenInput
                      type="file"
                      name="file"
                      onChange={handleFileChange}
                    />
                  </Button>
                </Box>
                <TextField
                  sx={{ width: 330 }}
                  label="Full Name"
                  required
                  name="fullname"
                  variant="outlined"
                  onChange={handleInput}
                  value={formData.fullname}
                />
                <TextField
                  sx={{ width: 330 }}
                  label="About"
                  name="about"
                  required
                  variant="outlined"
                  onChange={handleInput}
                  value={formData.about}
                />
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    sx={{ width: 330 }}
                    label="Date of Birth"
                    value={formData.dateOfBirth}
                    onChange={(newValue: string | null) =>
                      setFormData({ ...formData, dateOfBirth: newValue ?? "" })
                    }
                  />
                </LocalizationProvider>
                <FormControl sx={{ m: 1, width: 330 }}>
                  <InputLabel id="gender-select-label">Gender</InputLabel>
                  <Select
                    labelId="gender-select-label"
                    id="gender-select"
                    value={formData.gender}
                    name="gender"
                    label="Gender"
                    onChange={handleInput}
                  >
                    <MenuItem value="Male">Male</MenuItem>
                    <MenuItem value="Female">Female</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                </FormControl>
                <FormControl sx={{ m: 1, width: 330 }}>
                  <InputLabel id="category-select-label">
                    Artist Category
                  </InputLabel>
                  <Select
                    labelId="category-select-label"
                    id="category-select"
                    value={formData.category}
                    name="category"
                    label="Artist Category"
                    onChange={handleInput}
                  >
                    <MenuItem value="Crew">Crew</MenuItem>
                    <MenuItem value="Cast">Cast</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                </FormControl>
                <FormControl sx={{ m: 1, width: 330 }}>
                  <InputLabel id="profession-select-label">
                    Profession
                  </InputLabel>
                  <Select
                    labelId="profession-select-label"
                    id="profession-select"
                    multiple
                    name="profession"
                    value={formData.profession}
                    onChange={handleInput}
                    input={
                      <OutlinedInput
                        id="select-multiple-chip"
                        label="Profession"
                      />
                    }
                    renderValue={(selected) => (
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {selected.map((value: any) => (
                          <Chip key={value} label={value} />
                        ))}
                      </Box>
                    )}
                    MenuProps={MenuProps}
                  >
                    {formData.category === "Crew" &&
                      crew_names.map((name) => (
                        <MenuItem
                          key={name}
                          value={name}
                          style={getStyles(name, formData.profession, theme)}
                        >
                          {name}
                        </MenuItem>
                      ))}
                    {formData.category === "Cast" &&
                      cast_names.map((name) => (
                        <MenuItem
                          key={name}
                          value={name}
                          style={getStyles(name, formData.profession, theme)}
                        >
                          {name}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
                <Button
                  variant="contained"
                  endIcon={<SendIcon />}
                  type="submit"
                  sx={{ mt: 2 }}
                >
                  Submit
                </Button>

                {formSuccess && (
                  <Box sx={{ mt: 2 }}>
                    <Typography color="green">{formSuccessMessage}</Typography>
                  </Box>
                )}
              </Stack>
            </form>
          </Box>
        </Fade>
      </Modal>

      <Container maxWidth="lg" sx={{ borderRadius: 2, overflow: "hidden", mt: 2, mb: 4 }}>
        <Typography variant="h5" component="div" sx={{ fontWeight: "bold", mb: 2 }}>
          Cast
        </Typography>
        <Grid container spacing={1}>
          {cast.map((artist: any, index: number) => (
            <Grid item key={`member-${index}`} xs={6} sm={4} md={3} lg={2}>
              <Box sx={{ position: 'relative', justifyContent: "space-between", display: "flex", top: 30 }}>
                {isAdmin &&
                  <Button startIcon={<EditIcon />} onClick={() => { editCast(artist) }} />
                }
                {isAdmin &&
                  <Button startIcon={<DeleteIcon />} onClick={() => { deleteArtist(artist) }} />
                }
              </Box>
              <Box sx={{ textAlign: "center", p: 1 }}>
                <Avatar
                  alt={artist.name}
                  src={artist.profile_url}
                  sx={{ width: 120, height: 120, margin: "auto", mb: 1, cursor: 'pointer' }}
                  onClick={() => handleArtistClick(artist.id)}
                />
                <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                  {artist.name}
                </Typography>
                <Typography variant="body2">{artist.profession}</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>
      <Container maxWidth="lg" sx={{ borderRadius: 2, overflow: "hidden", mt: 2, mb: 4 }}>
        <Typography variant="h5" component="div" sx={{ fontWeight: "bold", mb: 2 }}>
          Crew
        </Typography>
        <Grid container spacing={1}>
          {crew.map((artist: any, index: number) => (
            <Grid item key={`member-${index}`} xs={6} sm={4} md={3} lg={2}>
              <Box sx={{ position: 'relative', justifyContent: "space-between", display: "flex", top: 30 }}>
                {isAdmin &&
                  <Button startIcon={<EditIcon />} onClick={() => { editCrew(artist) }} />
                }
                {isAdmin &&
                  <Button startIcon={<DeleteIcon />} onClick={() => { deleteArtist(artist) }} />
                }
              </Box>
              <Box sx={{ textAlign: "center", p: 1 }}>
                <Avatar
                  alt={artist.name}
                  src={artist.profile_url}
                  sx={{ width: 120, height: 120, margin: "auto", mb: 1, cursor: 'pointer' }}
                  onClick={() => handleArtistClick(artist.id)}
                />
                <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                  {artist.name}
                </Typography>
                <Typography variant="body2">{artist.profession}</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>
    </div>
  )
};