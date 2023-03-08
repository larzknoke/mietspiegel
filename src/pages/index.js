import { useEffect, useState } from "react";
import Head from "next/head";
import {
  Box,
  Button,
  Tooltip,
  Container,
  GridItem,
  Heading,
  SimpleGrid,
  VStack,
  FormControl,
  FormLabel,
  Input,
  HStack,
  Stack,
  Flex,
  Stat,
  StatNumber,
  StatLabel,
  StatHelpText,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Checkbox,
  Grid,
  Divider,
} from "@chakra-ui/react";
import { AddIcon, TriangleDownIcon, TriangleUpIcon } from "@chakra-ui/icons";
import { Select } from "chakra-react-select";
import strassen from "../../public/strassen.json";
import klassen from "../../public/klassen.json";
import merkmale from "../../public/merkmale.json";

function CurrenyFormater(currency) {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(currency);
}

export default function Home() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [miet, setMiet] = useState({});
  const [merkmaleSelected, setMerkmale] = useState([]);

  const uniqStrassen = [
    ...new Set(strassen.map((item) => item.strasse)),
  ].sort();

  const selectStrassen = Array.from(uniqStrassen, (v) => ({
    label: v,
    value: v,
    type: "strasse",
  }));

  useEffect(() => {
    handleLage();
  }, [miet.strasse, miet.hausnummer]);

  useEffect(() => {
    handleKlassen();
  }, [miet.baujahr, miet.groesse, miet.lage, miet.alternativ]);

  useEffect(() => {
    calcPunkte();
  }, [merkmaleSelected]);

  useEffect(() => {
    calcRabatt();
  }, [miet.punkte]);

  const handleMiet = (e) => {
    if (e.target != undefined && e.target.name != "") {
      setMiet({ ...miet, [e.target.name]: e.target.value });
    } else if (e.type != "" && e.label != undefined && e.value != undefined) {
      setMiet({ ...miet, [e.type]: e.value });
    }
  };

  const handleLage = () => {
    const strasse = strassen.find(
      (k) => k.strasse == miet.strasse && k.hausnummer == miet.hausnummer
    );
    setMiet({ ...miet, lage: strasse?.lage });
  };

  const handleKlassen = () => {
    const klasse = klassen.filter(
      (k) =>
        k.jahr < (miet.baujahr != "" ? miet.baujahr : miet.alternativ) &&
        k.groesse < miet.groesse
    );
    setMiet({
      ...miet,
      mittel: klasse?.at(-1)?.mittel - (miet.lage == "einfach" ? 0.195 : 0),
      unter: klasse?.at(-1)?.unter - (miet.lage == "einfach" ? 0.195 : 0),
      ober: klasse?.at(-1)?.ober - (miet.lage == "einfach" ? 0.195 : 0),
    });
  };

  const handleMerkmale = (e) => {
    if (e.target.checked === true) {
      setMerkmale([...merkmaleSelected, e.target.value]);
    } else if (e.target.checked === false) {
      let freshArray = merkmaleSelected.filter((val) => val !== e.target.value);
      setMerkmale([...freshArray]);
    }
  };

  const calcPunkte = () => {
    let punkte = 0;
    merkmaleSelected.map((ms) => {
      const alleMerkmale = [...merkmale.mindernd, ...merkmale.erhoehend];
      const merkmal = alleMerkmale.find((m) => m.value == ms);
      if (punkte > -100 && punkte < 100) {
        punkte += merkmal?.punkte;
      }
    });
    setMiet({ ...miet, punkte: punkte });
  };

  const calcRabatt = () => {
    let rabatt = 0;
    if (miet.punkte > 0) {
      rabatt = (miet.ober - miet.mittel) * (miet.punkte / 100);
    } else if (miet.punkte < 0) {
      rabatt = (miet.mittel - miet.unter) * (miet.punkte / 100);
    }
    setMiet({ ...miet, rabatt: rabatt });
  };

  return (
    <>
      <Head>
        <title>Mietspiegel</title>
        <meta name="description" content="Mietspiegel | Stadt Hof 2023" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Container
        display={"flex"}
        py={"8%"}
        flexDirection={"column"}
        alignItems={"center"}
        maxWidth={"6xl"}
        minHeight={"100vh"}
        gap={"32px"}
      >
        <VStack>
          <Heading as="h1" size={"xl"}>
            Mietspiegel{" "}
          </Heading>
          <Heading as="h2" size={"md"} color="gray.600">
            Stadt Hof 2023
          </Heading>
        </VStack>
        <Container
          bg="gray.600"
          color="white"
          maxW={"container.lg"}
          p={[0, 6, 12]}
        >
          <VStack gap={10}>
            <SimpleGrid spacing={9} columns={3} w={"full"}>
              <GridItem colSpan={2}>
                <FormControl>
                  <FormLabel>Straße</FormLabel>
                  <Select
                    name="strasse"
                    useBasicStyles
                    placeholder="Straße auswählen"
                    options={selectStrassen}
                    instanceId={"strassen-select"}
                    id={"strassen-select"}
                    onChange={handleMiet}
                  />
                </FormControl>
              </GridItem>
              <GridItem>
                <FormControl>
                  <FormLabel>Hausnummer</FormLabel>
                  <Input
                    name="hausnummer"
                    onChange={handleMiet}
                    type="number"
                  />
                </FormControl>
              </GridItem>
              <GridItem colSpan={1}>
                <FormControl>
                  <FormLabel>Baujahr</FormLabel>
                  <Input
                    name="baujahr"
                    onChange={handleMiet}
                    type="number"
                    min="1900"
                    max="2050"
                  />
                </FormControl>
              </GridItem>
              <GridItem colSpan={1}>
                <FormControl>
                  <Tooltip
                    label="dieser Wert wird nur genommen wenn kein genaues Baujahr angegeben ist"
                    placement="top"
                    textAlign={"center"}
                  >
                    <FormLabel>Baujahr Alternativ</FormLabel>
                  </Tooltip>
                  <Select
                    useBasicStyles
                    placeholder=""
                    name="alternativ"
                    onChange={handleMiet}
                    options={[
                      {
                        label: "bis 1949",
                        value: 1901,
                        type: "alternativ",
                      },
                      {
                        label: "1950-1960",
                        value: 1960,
                        type: "alternativ",
                      },
                      {
                        label: "1961-1977",
                        value: 1977,
                        type: "alternativ",
                      },
                      {
                        label: "1978-1999",
                        value: 1999,
                        type: "alternativ",
                      },
                      {
                        label: "ab 2000",
                        value: 2000,
                        type: "alternativ",
                      },
                    ]}
                  ></Select>
                </FormControl>
              </GridItem>
              <GridItem colSpan={1}>
                <FormControl>
                  <FormLabel>Größe in m²</FormLabel>
                  <Input name="groesse" onChange={handleMiet} type="number" />
                </FormControl>
              </GridItem>
              <GridItem colSpan={1}>
                <Button leftIcon={<AddIcon />} size={"sm"} onClick={onOpen}>
                  Merkmale hinzufügen
                </Button>
              </GridItem>
              {miet?.punkte != 0 && miet?.punkte != undefined && (
                <GridItem colSpan={2}>
                  <Text>ausgewählte Punkte: {miet.punkte}</Text>
                </GridItem>
              )}
            </SimpleGrid>
          </VStack>
        </Container>
        <Container
          bg="gray.600"
          color="white"
          maxW={"container.lg"}
          p={[0, 6, 12]}
        >
          {miet.lage && miet.groesse ? (
            <Grid
              templateRows="repeat(1, 1fr)"
              templateColumns="repeat(4, 1fr)"
              gap={6}
            >
              <GridItem>
                <Heading
                  as="h2"
                  size="md"
                  textAlign={"left"}
                  alignSelf={"center"}
                >
                  pro m²
                </Heading>
              </GridItem>
              <GridItem>
                <Stat color={"gray.400"} textAlign="end">
                  <StatNumber>{CurrenyFormater(miet.unter)}</StatNumber>
                  <StatLabel>Unterer Spannenwert</StatLabel>
                </Stat>
              </GridItem>
              <GridItem>
                <Stat textAlign="end">
                  <StatNumber>{CurrenyFormater(miet.mittel)}</StatNumber>
                  <StatLabel>Mittelwert</StatLabel>
                </Stat>
              </GridItem>
              <GridItem>
                <Stat color={"gray.400"} textAlign="end">
                  <StatNumber>{CurrenyFormater(miet.ober)}</StatNumber>
                  <StatLabel>Oberer Spannenwert</StatLabel>
                </Stat>
              </GridItem>
              <GridItem>
                <Heading
                  as="h2"
                  size="md"
                  textAlign={"left"}
                  alignSelf={"center"}
                >
                  Gesamt {miet.groesse} m²
                </Heading>
              </GridItem>
              <GridItem>
                <Stat color={"gray.400"} textAlign="end">
                  <StatNumber>
                    {CurrenyFormater(miet.unter * miet.groesse)}
                  </StatNumber>
                  <StatLabel>Unterer Spannenwert</StatLabel>
                </Stat>
              </GridItem>
              <GridItem>
                <Stat textAlign="end">
                  <StatNumber>
                    {CurrenyFormater(miet.mittel * miet.groesse)}
                  </StatNumber>
                  <StatLabel>Mittelwert</StatLabel>
                </Stat>
              </GridItem>
              <GridItem>
                <Stat color={"gray.400"} textAlign="end">
                  <StatNumber>
                    {CurrenyFormater(miet.ober * miet.groesse)}
                  </StatNumber>
                  <StatLabel>Oberer Spannenwert</StatLabel>
                </Stat>
              </GridItem>
              <GridItem colSpan={4}>
                <Divider />
              </GridItem>
              <GridItem>
                <Heading
                  as="h2"
                  size="md"
                  textAlign={"left"}
                  alignSelf={"center"}
                >
                  individuell Gesamt
                </Heading>
              </GridItem>
              <GridItem colStart={3} colEnd={3}>
                <Stat textAlign="end">
                  <StatNumber>
                    {CurrenyFormater(
                      (miet.mittel + miet.rabatt) * miet.groesse
                    )}
                  </StatNumber>
                  <StatLabel>inkl. Merkmale</StatLabel>
                </Stat>
              </GridItem>
              {miet.lage == "einfach" && (
                <GridItem colStart={1} colEnd={4}>
                  <Text color={"gray.500"} textAlign={"right"} ml={"auto"}>
                    Anmerkung: 0,195 €/m² Minderung wegen "einfacher" Lage
                  </Text>
                </GridItem>
              )}
            </Grid>
          ) : (
            <Heading size={"sm"} color={"gray.400"} textAlign={"center"}>
              Adresse nicht vorhanden oder Eingabe ungültig.
            </Heading>
          )}
        </Container>
        {/* {miet && (
          <Box
            position={"absolute"}
            right={0}
            bottom={0}
            bg={"green.600"}
            p={4}
          >
            {JSON.stringify(miet)}
          </Box>
        )} */}
        <Modal isOpen={isOpen} onClose={onClose} size={"6xl"}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              <Flex justifyContent={"space-between"}>
                <Text as={"span"}>Merkmale</Text>{" "}
                <Text
                  as={"span"}
                  fontSize={"md"}
                  fontWeight={400}
                  color={"gray.400"}
                  mr={10}
                >
                  {miet?.punkte ? `ausgewählt: ${miet.punkte}` : ""}
                </Text>
              </Flex>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <SimpleGrid columns={2} gap={24}>
                <GridItem>
                  <Heading as={"h3"} size={"sm"} mb={4}>
                    Wohnwertmindernd{" "}
                    <TriangleDownIcon color={"red.400"} ml={2} />
                  </Heading>
                  <Stack spacing={2}>
                    {merkmale.mindernd &&
                      merkmale.mindernd.map((m) => {
                        return (
                          <Checkbox
                            value={m.value}
                            colorScheme="red"
                            onChange={handleMerkmale}
                            isChecked={merkmaleSelected.includes(m.value)}
                          >
                            {m.merkmal}
                          </Checkbox>
                        );
                      })}
                  </Stack>
                </GridItem>
                <GridItem>
                  <Heading as={"h3"} size={"sm"} mb={4}>
                    Wohnwerterhöhend{" "}
                    <TriangleUpIcon color={"green.400"} ml={2} />
                  </Heading>
                  <Stack spacing={2}>
                    {merkmale.erhoehend &&
                      merkmale.erhoehend.map((m) => {
                        return (
                          <Checkbox
                            value={m.value}
                            colorScheme="green"
                            onChange={handleMerkmale}
                            isChecked={merkmaleSelected.includes(m.value)}
                          >
                            {m.merkmal}
                          </Checkbox>
                        );
                      })}
                  </Stack>
                </GridItem>
              </SimpleGrid>
            </ModalBody>

            <ModalFooter>
              <Button
                colorScheme="gray"
                mr={3}
                color={"red.400"}
                onClick={() => setMerkmale([])}
              >
                Alles abwählen
              </Button>
              <Button colorScheme="gray" onClick={onClose}>
                Schliessen
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Container>
    </>
  );
}
