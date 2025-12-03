"use client";
import Image from "next/image";
import { Header } from '../components/Header';
import { Hero } from '../components/Hero';
import { Barbers } from '../components/Barbers';
import { BookingModule } from '../components/BookingModule';
import { Testimonials } from '../components/Testimonials';
import { Footer } from '../components/Footer';
export default function Home() {
  return (
    <>
      <Header />
      <Hero />
      <Barbers />
      <BookingModule />
      <Testimonials />
      <Footer />
    </>
  );
}
